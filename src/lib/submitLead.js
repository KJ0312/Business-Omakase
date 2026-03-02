export async function submitLead(payload) {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase env is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }

  const endpoint = `${url}/rest/v1/leads`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Lead insert failed (${response.status}): ${errorText}`)
  }

  const inserted = await response.json()
  return inserted?.[0] ?? null
}

export async function triggerLeadAnalysis(leadId) {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey || !leadId) return

  const fnUrl = `${url}/functions/v1/analyze-lead`
  try {
    await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ leadId }),
    })
  } catch {
    // Keep submit success even if analysis fails.
  }
}

export async function enrichLeadOrigin(leadId) {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey || !leadId) return

  const fnUrl = `${url}/functions/v1/enrich-lead-origin`
  try {
    await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ leadId }),
    })
  } catch {
    // Keep submit success even if enrichment fails.
  }
}
