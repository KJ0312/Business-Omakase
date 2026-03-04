import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MenuPanel from './MenuPanel'
import LanguageSwitcher from './LanguageSwitcher'
import { LANGS } from '../i18n/langs'

const LANGUAGE_KEY = 'business_omakase_lang_ui'
const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script'

let googleTranslateReadyPromise = null

const getIncludedLanguages = () => LANGS.map((item) => item.code).join(',')

const ensureGoogleTranslate = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.google?.translate?.TranslateElement) {
    if (!window.__businessOmakaseTranslateInitialized) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          includedLanguages: getIncludedLanguages(),
        },
        'google_translate_element',
      )
      window.__businessOmakaseTranslateInitialized = true
    }
    return Promise.resolve()
  }

  if (googleTranslateReadyPromise) {
    return googleTranslateReadyPromise
  }

  googleTranslateReadyPromise = new Promise((resolve) => {
    window.googleTranslateElementInit = () => {
      if (!window.__businessOmakaseTranslateInitialized) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
            includedLanguages: getIncludedLanguages(),
          },
          'google_translate_element',
        )
        window.__businessOmakaseTranslateInitialized = true
      }
      resolve()
    }

    const existingScript = document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)
    if (existingScript) {
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_TRANSLATE_SCRIPT_ID
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    script.onerror = () => {
      resolve()
    }
    document.body.appendChild(script)
  })

  return googleTranslateReadyPromise
}

const applyGoogleTranslateLanguage = (lang) => {
  if (typeof window === 'undefined') {
    return
  }

  const combo = document.querySelector('.goog-te-combo')
  if (!combo) {
    return
  }

  const nextValue = lang === 'en' ? 'en' : lang
  if (combo.value === nextValue) {
    return
  }

  combo.value = nextValue
  combo.dispatchEvent(new Event('change'))
}

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

  useEffect(() => {
    let cancelled = false

    ensureGoogleTranslate().then(() => {
      if (cancelled) return

      const tryApply = () => {
        applyGoogleTranslateLanguage(lang)
      }

      tryApply()
      window.setTimeout(tryApply, 250)
      window.setTimeout(tryApply, 900)
    })

    return () => {
      cancelled = true
    }
  }, [lang])

  return (
    <header className={`header${isSubPage ? ' header-subpage' : ''}`}>
      <div id="google_translate_element" className="google-translate-anchor" />
      <Link className="header-logo notranslate" to="/" onClick={() => setIsOpen(false)} translate="no" lang="en">
        Business Omakase
      </Link>
      <div className="header-actions">
        <LanguageSwitcher lang={lang} setLang={setLang} loading={false} />
        <button
          className="menu-trigger notranslate"
          type="button"
          aria-label="Open menu"
          onClick={() => setIsOpen(true)}
          translate="no"
          lang="en"
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
