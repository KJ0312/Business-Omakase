import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const menuItems = [
  { number: '01', label: 'About Us', to: '/aboutus' },
  { number: '02', label: 'How it Works', to: '/#how-it-works' },
  { number: '03', label: 'Services', to: '/service' },
  { number: '04', label: 'Contact Us', to: '/#contact' },
]

export default function MenuPanel({ isOpen, onClose }) {
  const firstItemRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    firstItemRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <>
      <div
        className={`menu-overlay${isOpen ? ' menu-overlay-open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside
        className={`menu-panel${isOpen ? ' menu-panel-open' : ''}`}
        onMouseLeave={onClose}
        aria-hidden={!isOpen}
      >
        <nav className="menu-panel-nav" aria-label="menu panel navigation">
          {menuItems.map((item, index) => (
            <Link
              key={item.to}
              ref={index === 0 ? firstItemRef : null}
              className="menu-panel-item"
              to={item.to}
              onClick={onClose}
            >
              <span className="menu-panel-number">{item.number}</span>
              <span className="menu-panel-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
