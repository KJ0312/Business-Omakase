const KEYS = {
  sessionId: 'bo_session_id',
  sessionStartedAt: 'bo_session_started_at',
  visitCount: 'bo_visit_count',
  pagesViewed: 'bo_pages_viewed',
  maxScrollDepth: 'bo_max_scroll_depth',
  firstLanding: 'bo_first_landing',
  utm: 'bo_utm',
};

function hasWindow() {
  return typeof window !== 'undefined';
}

export function getTrackingStorageKey(name) {
  return KEYS[name];
}

export function readStorage(name, fallback = '') {
  if (!hasWindow()) return fallback;
  const key = KEYS[name];
  if (!key) return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

export function writeStorage(name, value) {
  if (!hasWindow()) return;
  const key = KEYS[name];
  if (!key) return;
  window.localStorage.setItem(key, String(value));
}

export function readJsonStorage(name, fallback = {}) {
  const raw = readStorage(name, '');
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(name, value) {
  writeStorage(name, JSON.stringify(value));
}

export function hasTrackingWindow() {
  return hasWindow();
}

