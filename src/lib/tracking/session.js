import { hasTrackingWindow, readJsonStorage, readStorage, writeJsonStorage, writeStorage } from './storage';
import { upsertToTable } from './supabaseRest';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `bo_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function parseUtm() {
  if (!hasTrackingWindow()) return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
  };
}

function deviceTypeFromWidth() {
  if (!hasTrackingWindow()) return 'desktop';
  const width = window.innerWidth;
  if (width <= 767) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

export async function initTrackingSession() {
  if (!hasTrackingWindow()) return null;

  const now = Date.now();
  const existingSessionId = readStorage('sessionId', '');
  const startedAtRaw = Number(readStorage('sessionStartedAt', '0'));
  const isExpired = !startedAtRaw || now - startedAtRaw > THIRTY_DAYS_MS;
  const sessionId = !existingSessionId || isExpired ? generateSessionId() : existingSessionId;

  if (!existingSessionId || isExpired) {
    writeStorage('sessionId', sessionId);
    writeStorage('sessionStartedAt', String(now));
    writeStorage('visitCount', '0');
    writeStorage('pagesViewed', '0');
    writeStorage('maxScrollDepth', '0');
  }

  const visitCount = Number(readStorage('visitCount', '0')) + 1;
  writeStorage('visitCount', String(visitCount));

  const firstLanding = readStorage('firstLanding', '') || window.location.pathname || '/';
  writeStorage('firstLanding', firstLanding);

  const prevUtm = readJsonStorage('utm', {});
  const nextUtm = { ...prevUtm, ...parseUtm() };
  writeJsonStorage('utm', nextUtm);

  const payload = {
    session_id: sessionId,
    first_seen_at: new Date(startedAtRaw || now).toISOString(),
    last_seen_at: new Date(now).toISOString(),
    landing_page: firstLanding,
    referrer_url: document.referrer || '',
    utm_source: nextUtm.utm_source || null,
    utm_medium: nextUtm.utm_medium || null,
    utm_campaign: nextUtm.utm_campaign || null,
    utm_content: nextUtm.utm_content || null,
    utm_term: nextUtm.utm_term || null,
    device_type: deviceTypeFromWidth(),
    pages_viewed: Number(readStorage('pagesViewed', '0')),
    max_scroll_depth_pct: Number(readStorage('maxScrollDepth', '0')),
    total_time_on_site_sec: 0,
  };

  await upsertToTable('sessions', payload, 'session_id');
  return sessionId;
}

export function getTrackingSnapshot() {
  if (!hasTrackingWindow()) return null;
  const utm = readJsonStorage('utm', {});
  return {
    session_id: readStorage('sessionId', ''),
    visit_count: Number(readStorage('visitCount', '1')) || 1,
    pages_viewed: Number(readStorage('pagesViewed', '1')) || 1,
    scroll_depth_pct: Number(readStorage('maxScrollDepth', '0')) || 0,
    landing_page: readStorage('firstLanding', window.location.pathname || '/'),
    referrer_url: document.referrer || '',
    device_type: deviceTypeFromWidth(),
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null,
    utm_content: utm.utm_content || null,
    utm_term: utm.utm_term || null,
  };
}

