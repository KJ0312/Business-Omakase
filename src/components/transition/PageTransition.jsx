import { MOTION, prefersReducedMotion } from '../../styles/motion'

export default function PageTransition({ children, className = '' }) {
  const reduced = prefersReducedMotion()
  return (
    <div
      className={`pageTransition${reduced ? ' is-reduced' : ''} ${className}`.trim()}
      style={{ '--page-duration': `${MOTION.intro.durationMs}ms`, '--page-ease': MOTION.intro.easing }}
    >
      {children}
    </div>
  )
}
