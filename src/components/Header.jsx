import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MenuPanel from './MenuPanel'
import LanguageSwitcher from './LanguageSwitcher'

const LANGUAGE_KEY = 'business_omakase_lang_ui'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    return window.localStorage.getItem(LANGUAGE_KEY) || 'en'
  })

  const { pathname } = useLocation()
  const isSubPage = pathname !== '/'

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(LANGUAGE_KEY, lang)
  }, [lang])

  return (
    <header className={`header${isSubPage ? ' header-subpage' : ''}`}>
      <Link className="header-logo" to="/" onClick={() => setIsOpen(false)}>
        Business Omakase
      </Link>
      <div className="header-actions">
        <LanguageSwitcher lang={lang} setLang={setLang} loading={false} />
        <button
          className="menu-trigger"
          type="button"
          aria-label="Open menu"
          onClick={() => setIsOpen(true)}
        >
          <span className="menu-trigger-text">Menu</span>
          <span className="menu-trigger-lines" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>
      <MenuPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  )
}
