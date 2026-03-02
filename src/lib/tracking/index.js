import { initTrackingSession, getTrackingSnapshot } from './session';
import { bumpPagesViewed, flushSessionMetrics, getTimeOnSiteSec, startTrackingMetrics } from './metrics';
import { trackEvent } from './events';

let cleanupScroll = () => {};

export async function bootstrapTracking() {
  await initTrackingSession();
  cleanupScroll = startTrackingMetrics();
  return () => cleanupScroll();
}

export async function trackPageView(pathname) {
  const pages = bumpPagesViewed();
  await trackEvent('page_view', pathname, { pages_viewed: pages });
}

export async function trackFormEvent(eventName, meta = {}) {
  await trackEvent(eventName, undefined, meta);
}

export async function collectLeadTrackingPayload() {
  const snapshot = getTrackingSnapshot();
  return {
    ...(snapshot || {}),
    time_on_site_sec: getTimeOnSiteSec(),
  };
}

export async function flushTrackingOnExit() {
  await flushSessionMetrics();
}

