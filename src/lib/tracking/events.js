import { insertToTable } from './supabaseRest';
import { getTrackingSnapshot } from './session';

export async function trackEvent(eventName, pagePath, meta = {}) {
  const snapshot = getTrackingSnapshot();
  const payload = {
    event_name: eventName,
    page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname : ''),
    session_id: snapshot?.session_id || null,
    meta,
  };
  await insertToTable('events', payload);
}

