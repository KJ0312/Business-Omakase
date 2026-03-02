import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
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
    const { leadId } = await request.json();
    if (!leadId) {
      return new Response(JSON.stringify({ error: 'Missing leadId' }), { status: 400 });
    }

    const countryGuess = inferCountryFromHeaders(request.headers) || null;
    const cityGuess = inferCityFromHeaders(request.headers);

    const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
    const { error } = await supabase
      .from('leads')
      .update({
        country_guess: countryGuess,
        city_guess: cityGuess,
      })
      .eq('id', leadId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ ok: true, leadId, country_guess: countryGuess, city_guess: cityGuess }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

