import { MOTION } from '../../styles/motion'

export default function DoorTransition({ isActive, className = '' }) {
  return (
    <div
      className={`doorTransition ${className}${isActive ? ' is-active' : ''}`.trim()}
      style={{ '--door-duration': `${MOTION.door.durationMs}ms`, '--door-ease': MOTION.door.easing }}
      aria-hidden="true"
    >
      <span className="doorPanel doorPanelLeft" />
      <span className="doorPanel doorPanelRight" />
    </div>
  )
}
