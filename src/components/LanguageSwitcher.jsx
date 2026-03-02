import { useEffect, useRef, useState } from 'react'
import { LANGS } from '../i18n/langs'

export default function LanguageSwitcher({ lang, setLang, loading }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const current = LANGS.find((item) => item.code === lang) ?? LANGS[0]

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSelect = (code) => {
    setLang(code)
    setOpen(false)
  }

  return (
    <div className="lang-switcher" ref={wrapRef}>
      <button
        type="button"
        className="lang-trigger"
        aria-label="Select language"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="lang-icon" aria-hidden="true">
          {current.icon === 'globe' ? '🌐' : current.flag}
        </span>
        <span className="lang-label">{loading ? '...' : current.label}</span>
      </button>

      {open ? (
        <div className="lang-menu" role="menu" aria-label="Language options">
          {LANGS.map((item) => (
            <button
              key={item.code}
              type="button"
              role="menuitem"
              className={`lang-item${item.code === lang ? ' is-active' : ''}`}
              onClick={() => handleSelect(item.code)}
            >
              <span className="lang-item-icon" aria-hidden="true">
                {item.icon === 'globe' ? '🌐' : item.flag}
              </span>
              <span className="lang-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
