import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

type LeadRow = {
  id: string;
  lead_type: string | null;
  service_type: string | null;
  summary: string | null;
  preferred_channel: string[] | null;
  utm_source: string | null;
  country_guess: string | null;
  service_scope: string[] | null;
  language: string | null;
};

type AnalysisResult = {
  intent_category: string | null;
  industry_detected: string | null;
  urgency_level: 'low' | 'mid' | 'high' | null;
  project_complexity: 'low' | 'mid' | 'high' | null;
  budget_signal: 'none' | 'weak' | 'strong' | null;
  ai_summary: string | null;
  ai_tags: string[] | null;
};

const OPENAI_MODEL = 'gpt-4.1-mini';

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getHeaderValue(headers: Headers, keys: string[]) {
  for (const key of keys) {
    const value = headers.get(key);
    if (value) return value;
  }
  return '';
}

function inferCountryFromHeaders(headers: Headers) {
  const explicit = getHeaderValue(headers, [
    'x-vercel-ip-country',
    'cf-ipcountry',
    'x-country-code',
    'x-appengine-country',
    'x-geo-country',
  ])
    .trim()
    .toUpperCase();
  if (explicit && explicit.length <= 3 && explicit !== 'XX') return explicit;

  const language = headers.get('accept-language') || '';
  const match = language.match(/-([A-Za-z]{2})\b/);
  if (match?.[1]) return match[1].toUpperCase();
  return '';
}

function inferCityFromHeaders(headers: Headers) {
  return (
    getHeaderValue(headers, ['x-vercel-ip-city', 'x-geo-city', 'cf-ipcity']).trim() || null
  );
}

function scoreLead(lead: LeadRow) {
  let score = 0;
  const summaryLength = (lead.summary || '').trim().length;
  const channels = lead.preferred_channel || [];
  const country = (lead.country_guess || '').toUpperCase();
  const priorityCountries = new Set(['CH', 'FR', 'DE', 'IT', 'AE', 'SA']);

  if (lead.lead_type === 'organization') score += 25;
  if (lead.service_type === 'signature') score += 20;
  if (summaryLength >= 200) score += 15;
  if (channels.some((item) => item.toLowerCase().includes('whatsapp'))) score += 10;
  if (lead.utm_source) score += 5;
  if (priorityCountries.has(country)) score += 10;

  return clamp(score);
}

async function classifyWithOpenAI(lead: LeadRow, apiKey: string): Promise<AnalysisResult> {
  const schema = {
    name: 'lead_analysis',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        intent_category: { type: ['string', 'null'] },
        industry_detected: { type: ['string', 'null'] },
        urgency_level: { type: ['string', 'null'], enum: ['low', 'mid', 'high', null] },
        project_complexity: { type: ['string', 'null'], enum: ['low', 'mid', 'high', null] },
        budget_signal: { type: ['string', 'null'], enum: ['none', 'weak', 'strong', null] },
        ai_summary: { type: ['string', 'null'] },
        ai_tags: { type: ['array', 'null'], items: { type: 'string' } },
      },
      required: [
        'intent_category',
        'industry_detected',
        'urgency_level',
        'project_complexity',
        'budget_signal',
        'ai_summary',
        'ai_tags',
      ],
    },
  };

  const prompt = `Analyze this business lead for a premium product studio. Keep "Signature", "Twist", and "Business Omakase" names unchanged if referenced. Return only JSON.`;
  const input = {
    summary: lead.summary,
    lead_type: lead.lead_type,
    service_type: lead.service_type,
    service_scope: lead.service_scope || [],
    language: lead.language,
    country_guess: lead.country_guess,
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        { role: 'system', content: [{ type: 'text', text: prompt }] },
        { role: 'user', content: [{ type: 'text', text: JSON.stringify(input) }] },
      ],
      text: {
        format: { type: 'json_schema', name: 'lead_analysis', schema: schema.schema, strict: true },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API failed (${response.status})`);
  }

  const payload = await response.json();
  const outputText =
    payload?.output?.[0]?.content?.find((c: { type: string }) => c.type === 'output_text')?.text ??
    payload?.output_text;
  if (!outputText) throw new Error('No output_text from OpenAI');

  return JSON.parse(outputText);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabaseUrl = getEnv('SUPABASE_URL');
    const serviceRole = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const openAiKey = getEnv('OPENAI_API_KEY');
    const { leadId } = await request.json();
    if (!leadId) {
      return new Response(JSON.stringify({ error: 'Missing leadId' }), { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, lead_type, service_type, summary, preferred_channel, utm_source, country_guess, service_scope, language')
      .eq('id', leadId)
      .single<LeadRow>();

    if (leadError || !lead) {
      return new Response(JSON.stringify({ error: leadError?.message || 'Lead not found' }), { status: 404 });
    }

    const inferredCountry = lead.country_guess || inferCountryFromHeaders(request.headers) || null;
    const inferredCity = inferCityFromHeaders(request.headers);
    const enrichedLead = {
      ...lead,
      country_guess: inferredCountry,
    };

    let analysis: AnalysisResult = {
      intent_category: null,
      industry_detected: null,
      urgency_level: null,
      project_complexity: null,
      budget_signal: null,
      ai_summary: null,
      ai_tags: [],
    };

    try {
      analysis = await classifyWithOpenAI(enrichedLead, openAiKey);
    } catch (error) {
      console.error('classifyWithOpenAI error:', error);
    }

    const score = scoreLead(enrichedLead);
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        country_guess: inferredCountry,
        city_guess: inferredCity,
        lead_score: score,
        intent_category: analysis.intent_category,
        industry_detected: analysis.industry_detected,
        urgency_level: analysis.urgency_level,
        project_complexity: analysis.project_complexity,
        budget_signal: analysis.budget_signal,
        ai_summary: analysis.ai_summary,
        ai_tags: analysis.ai_tags || [],
        analyzed_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, leadId, lead_score: score }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
