function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export function hasSupabaseRestConfig() {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

export async function insertToTable(table, payload) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return { ok: false, error: 'Missing Supabase env' };

  try {
    const response = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { ok: false, error: await response.text() };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed request' };
  }
}

export async function upsertToTable(table, payload, onConflict) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return { ok: false, error: 'Missing Supabase env' };

  const conflictQuery = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';
  try {
    const response = await fetch(`${url}/rest/v1/${table}${conflictQuery}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { ok: false, error: await response.text() };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed request' };
  }
}

