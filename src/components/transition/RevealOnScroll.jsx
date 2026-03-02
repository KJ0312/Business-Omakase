import { useEffect, useRef, useState } from 'react'
import { MOTION, prefersReducedMotion } from '../../styles/motion'

export default function RevealOnScroll({
  as: Tag = 'div',
  className = '',
  children,
  amount = MOTION.reveal.amount,
  once = true,
}) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef(null)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    const node = elementRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(node)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold: amount }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [amount, once])

  return (
    <Tag
      ref={elementRef}
      className={`revealOnScroll${isVisible ? ' is-visible' : ''}${reduced ? ' is-reduced' : ''} ${className}`.trim()}
      style={{ '--reveal-duration': `${MOTION.reveal.durationMs}ms`, '--reveal-ease': MOTION.reveal.easing }}
    >
      {children}
    </Tag>
  )
}
