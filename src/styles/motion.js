export const MOTION = {
  intro: {
    durationMs: 820,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  reveal: {
    durationMs: 760,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    amount: 0.3,
  },
  door: {
    durationMs: 560,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  servicesStagger: {
    stepMs: 160,
  },
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
