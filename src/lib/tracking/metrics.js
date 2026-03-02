import { hasTrackingWindow, readStorage, writeStorage } from './storage';
import { upsertToTable } from './supabaseRest';

let startedAt = Date.now();

function getScrollDepthPercent() {
  if (!hasTrackingWindow()) return 0;
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)));
}

export function startTrackingMetrics() {
  if (!hasTrackingWindow()) return () => {};
  startedAt = Date.now();

  const onScroll = () => {
    const next = getScrollDepthPercent();
    const prev = Number(readStorage('maxScrollDepth', '0')) || 0;
    if (next > prev) writeStorage('maxScrollDepth', String(next));
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener('scroll', onScroll);
}

export function bumpPagesViewed() {
  if (!hasTrackingWindow()) return 1;
  const next = (Number(readStorage('pagesViewed', '0')) || 0) + 1;
  writeStorage('pagesViewed', String(next));
  return next;
}

export function getTimeOnSiteSec() {
  return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
}

export async function flushSessionMetrics() {
  if (!hasTrackingWindow()) return;
  const sessionId = readStorage('sessionId', '');
  if (!sessionId) return;
  await upsertToTable(
    'sessions',
    {
      session_id: sessionId,
      last_seen_at: new Date().toISOString(),
      pages_viewed: Number(readStorage('pagesViewed', '1')) || 1,
      max_scroll_depth_pct: Number(readStorage('maxScrollDepth', '0')) || 0,
      total_time_on_site_sec: getTimeOnSiteSec(),
    },
    'session_id',
  );
}

