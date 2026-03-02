import { useEffect, useMemo, useRef, useState } from 'react'
import { enrichLeadOrigin, submitLead, triggerLeadAnalysis } from '../lib/submitLead'
import { collectLeadTrackingPayload, trackFormEvent } from '../lib/tracking'

const COUNTRY_OPTIONS = [
  { country: 'United States', code: '+1' },
  { country: 'France', code: '+33' },
  { country: 'Spain', code: '+34' },
  { country: 'Germany', code: '+49' },
  { country: 'Italy', code: '+39' },
  { country: 'Saudi Arabia', code: '+966' },
  { country: 'Russia', code: '+7' },
  { country: 'Portugal', code: '+351' },
  { country: 'China', code: '+86' },
  { country: 'Japan', code: '+81' },
  { country: 'South Korea', code: '+82' },
  { country: 'Vietnam', code: '+84' },
  { country: 'Indonesia', code: '+62' },
  { country: 'Thailand', code: '+66' },
]

const SERVICE_TYPES = [
  { id: 'signature', label: 'Signature — New Development' },
  { id: 'twist', label: 'Twist — Maintenance & Upgrade' },
]

const SERVICE_SCOPE_MAP = {
  individual: {
    signature: ['Personal Projects', 'Professionals', 'Aspiring Founders'],
    twist: ['Solo Founders', 'Digital Nomads', 'Influencers'],
  },
  organization: {
    signature: [
      'Startups',
      'New Ventures',
      'Family Business Companies',
      'Launching New Initiatives',
    ],
    twist: [
      'SMEs',
      'Early-Stage Startups',
      'Family Businesses In Transition',
      'Companies Without In-House Technical Operators',
    ],
  },
}

export default function ContactSection() {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [isSubmitSuccessOpen, setIsSubmitSuccessOpen] = useState(false)
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false)
  const [audience, setAudience] = useState('')
  const [serviceType, setServiceType] = useState([])
  const [serviceScope, setServiceScope] = useState([])
  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [isCustomCountry, setIsCustomCountry] = useState(false)
  const [customCountry, setCustomCountry] = useState('')
  const [customCountryCode, setCustomCountryCode] = useState('')
  const [preferredChannels, setPreferredChannels] = useState([])
  const [otherChannel, setOtherChannel] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [hasFormStarted, setHasFormStarted] = useState(false)
  const countryPickerRef = useRef(null)

  useEffect(() => {
    if (!isInquiryOpen) {
      setIsSubmitSuccessOpen(false)
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsCountryMenuOpen(false)
        setIsInquiryOpen(false)
      }
    }

    const handlePointerDown = (event) => {
      if (countryPickerRef.current?.contains(event.target)) {
        return
      }
      setIsCountryMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handlePointerDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isInquiryOpen])

  const availableScopes = useMemo(() => {
    if (!audience || serviceType.length === 0) {
      return []
    }

    const next = serviceType.flatMap((typeId) => SERVICE_SCOPE_MAP[audience][typeId] ?? [])
    return Array.from(new Set(next))
  }, [audience, serviceType])

  useEffect(() => {
    setServiceScope((prev) => prev.filter((item) => availableScopes.includes(item)))
  }, [availableScopes])

  const toggleServiceType = (id) => {
    setServiceType((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleServiceScope = (scope) => {
    setServiceScope((prev) => (prev.includes(scope) ? prev.filter((item) => item !== scope) : [...prev, scope]))
  }

  const togglePreferredChannel = (channel) => {
    setPreferredChannels((prev) =>
      prev.includes(channel) ? prev.filter((item) => item !== channel) : [...prev, channel],
    )
  }

  const setPresetCountry = (option) => {
    setIsCustomCountry(false)
    setCountry(option.country)
    setCountryCode(option.code)
    setCustomCountry('')
    setCustomCountryCode('')
    setIsCountryMenuOpen(false)
  }

  const setAddCountry = () => {
    setIsCustomCountry(true)
    setCountry('')
    setCountryCode('')
    setIsCountryMenuOpen(false)
  }

  const markFormStarted = () => {
    if (hasFormStarted) return
    setHasFormStarted(true)
    trackFormEvent('form_start')
  }

  return (
    <div className="contact-premium">
      <div className="contact-bg-layer" aria-hidden="true">
        <div className="contact-bg-center">
          <img className="contact-bg-image" src="/Footer Background.png?v=20260301" alt="" />
          <button
            type="button"
            className="reserve-now-box"
            onClick={() => {
              setIsInquiryOpen(true)
              trackFormEvent('form_open')
            }}
          >
            Reserve Now
          </button>
        </div>
        <div className="reserve-now-copy" aria-label="Reserve now description">
          <p>A limited number of client engagements are available for Q1 2026.</p>
          <p>
            Share your idea with us, and our team will carefully review and prioritize each
            submission before responding.
          </p>
        </div>
        <div className="contact-bg-ambient" />
      </div>

      <div className="introLineRow contact-repeat-bottom" aria-label="contact bottom repeat">
        <span className="introLineLabel">Seoul × Geneva</span>
        <span className="introLineTrack" aria-hidden="true" />
        <span className="introLineLabel introLineAction">contact@businessomakase.com</span>
      </div>

      {isInquiryOpen ? (
        <div className="inquiry-overlay" onClick={() => setIsInquiryOpen(false)}>
          <section className="inquiry-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="inquiry-back-button"
              onClick={() => setIsInquiryOpen(false)}
              aria-label="Go back"
            >
              ← Back
            </button>
            <h2 className="inquiry-title">Business Inquiry</h2>
            <form
              className="inquiry-form"
              onSubmit={async (event) => {
                event.preventDefault()
                setSubmitError('')
                setIsSubmitting(true)

                try {
                  const formData = new FormData(event.currentTarget)
                  const name = String(formData.get('name') || '').trim()
                  const email = String(formData.get('email') || '').trim()
                  const summary = String(formData.get('summary') || '').trim()
                  const company = audience === 'organization' ? String(formData.get('company') || '').trim() || 'Organization Inquiry' : null
                  const language =
                    typeof window !== 'undefined'
                      ? window.localStorage.getItem('business_omakase_lang_ui') || 'en'
                      : 'en'
                  const sourcePage =
                    typeof window !== 'undefined' ? window.location.pathname : '/contact'

                  const countryText = isCustomCountry
                    ? customCountry || 'Custom Country'
                    : country || 'Not selected'
                  const codeText = isCustomCountry ? customCountryCode || '' : countryCode || ''
                  const phoneRaw = String(formData.get('phone') || '').trim()
                  if (!audience || serviceType.length === 0 || serviceScope.length === 0) {
                    throw new Error('Select audience, service type, and service scope before submit.')
                  }

                  const trackingPayload = await collectLeadTrackingPayload()

                  const inserted = await submitLead({
                    name,
                    email,
                    company: company || null,
                    message: summary || null,
                    summary: summary || null,
                    language,
                    source_page: sourcePage,
                    phone_country: countryText,
                    phone_code: codeText,
                    phone_number: phoneRaw || null,
                    preferred_channel: [
                      ...preferredChannels.map((item) => item.toLowerCase()),
                      ...(preferredChannels.includes('Others') && otherChannel
                        ? [otherChannel]
                        : []),
                    ],
                    lead_type: audience || null,
                    service_type: serviceType[0] || null,
                    service_scope: serviceScope,
                    status: 'NEW',
                    ...trackingPayload,
                  })

                  await trackFormEvent('form_submit', {
                    lead_id: inserted?.id || null,
                    service_type: serviceType[0] || null,
                    lead_type: audience || null,
                  })

                  if (inserted?.id) {
                    await enrichLeadOrigin(inserted.id)
                    triggerLeadAnalysis(inserted.id)
                  }

                  setIsSubmitSuccessOpen(true)
                } catch (error) {
                  setSubmitError(error instanceof Error ? error.message : 'Submission failed')
                } finally {
                  setIsSubmitting(false)
                }
              }}
            >
              <label className="inquiry-field">
                <span>Name</span>
                <input type="text" name="name" required onChange={markFormStarted} />
              </label>

              <label className="inquiry-field">
                <span>Email</span>
                <input type="email" name="email" required onChange={markFormStarted} />
              </label>

              <fieldset className="inquiry-fieldset">
                <legend>Phone Number (WhatsApp)</legend>
                <div className={`phone-grid${isCustomCountry ? ' is-custom' : ''}`}>
                  <div className="inquiry-country-picker" ref={countryPickerRef}>
                    <span className="sr-only">Country Picker</span>
                    <button
                      type="button"
                      className="lang-trigger inquiry-country-button"
                      onClick={() => setIsCountryMenuOpen((prev) => !prev)}
                    >
                      <span className="lang-label">
                        {isCustomCountry ? customCountry || '+ADD' : country || 'Select Country'}
                      </span>
                    </button>
                    {isCountryMenuOpen ? (
                      <div className="lang-menu inquiry-country-menu" role="menu" aria-label="Country Picker">
                        {COUNTRY_OPTIONS.map((option) => (
                          <button
                            key={option.country}
                            type="button"
                            className="lang-item"
                            role="menuitem"
                            onClick={() => setPresetCountry(option)}
                          >
                            <span className="lang-item-label">
                              {option.country} ({option.code})
                            </span>
                          </button>
                        ))}
                        <button
                          type="button"
                          className="lang-item"
                          role="menuitem"
                          onClick={setAddCountry}
                        >
                          <span className="lang-item-label">+ADD</span>
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {isCustomCountry ? (
                    <>
                      <label>
                        <span className="sr-only">Custom Country</span>
                        <input
                          type="text"
                          value={customCountry}
                          onChange={(event) => setCustomCountry(event.target.value)}
                          placeholder="Custom country"
                        />
                      </label>
                      <label>
                        <span className="sr-only">Country Code Picker</span>
                        <input
                          type="text"
                          value={customCountryCode}
                          onChange={(event) => setCustomCountryCode(event.target.value)}
                          placeholder="+Code"
                        />
                      </label>
                    </>
                  ) : (
                    <label>
                      <span className="sr-only">Country Code Picker</span>
                      <input type="text" value={countryCode} readOnly aria-readonly="true" placeholder="+Code" />
                    </label>
                  )}

                  <label className="phone-number-field">
                    <span className="sr-only">Phone Number</span>
                    <input type="tel" name="phone" placeholder="Phone number" />
                  </label>
                </div>
              </fieldset>

              <fieldset className="inquiry-fieldset">
                <legend>Preferred Channel</legend>
                <div className="inquiry-check-grid inquiry-check-grid-channels">
                  <label className="inquiry-check">
                    <input
                      type="checkbox"
                      checked={preferredChannels.includes('Email')}
                      onChange={() => togglePreferredChannel('Email')}
                    />
                    <span>Email</span>
                  </label>
                  <label className="inquiry-check">
                    <input
                      type="checkbox"
                      checked={preferredChannels.includes('WhatsApp')}
                      onChange={() => togglePreferredChannel('WhatsApp')}
                    />
                    <span>WhatsApp</span>
                  </label>
                  <label className="inquiry-check">
                    <input
                      type="checkbox"
                      checked={preferredChannels.includes('Others')}
                      onChange={() => togglePreferredChannel('Others')}
                    />
                    <span>Others</span>
                  </label>
                  {preferredChannels.includes('Others') ? (
                    <label className="inquiry-field inquiry-other-channel-field">
                      <span className="sr-only">Other Preferred Channel</span>
                      <input
                        type="text"
                        value={otherChannel}
                        onChange={(event) => setOtherChannel(event.target.value)}
                        placeholder="Enter your preferred channel"
                      />
                    </label>
                  ) : null}
                </div>
              </fieldset>

              <fieldset className="inquiry-fieldset">
                <legend>Individuals or Organization</legend>
                <div className="inquiry-check-grid">
                  <label className="inquiry-check">
                    <input
                      type="checkbox"
                      checked={audience === 'individual'}
                      onChange={() => setAudience((prev) => (prev === 'individual' ? '' : 'individual'))}
                    />
                    <span>Individuals</span>
                  </label>
                  <label className="inquiry-check">
                    <input
                      type="checkbox"
                      checked={audience === 'organization'}
                      onChange={() => setAudience((prev) => (prev === 'organization' ? '' : 'organization'))}
                    />
                    <span>Organization</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="inquiry-fieldset">
                <legend>Service Type</legend>
                <div className="inquiry-check-grid">
                  {SERVICE_TYPES.map((item) => (
                    <label key={item.id} className="inquiry-check">
                      <input
                        type="checkbox"
                        checked={serviceType.includes(item.id)}
                        onChange={() => toggleServiceType(item.id)}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="inquiry-fieldset">
                <legend>Service Scope</legend>
                <div className="inquiry-check-grid">
                  {availableScopes.length > 0 ? (
                    availableScopes.map((scope) => (
                      <label key={scope} className="inquiry-check">
                        <input
                          type="checkbox"
                          checked={serviceScope.includes(scope)}
                          onChange={() => toggleServiceScope(scope)}
                        />
                        <span>{scope}</span>
                      </label>
                    ))
                  ) : (
                    <p className="inquiry-helper">
                      Select Individuals or Organization and Service Type first.
                    </p>
                  )}
                </div>
              </fieldset>

              <label className="inquiry-field">
                <span>Summary</span>
                <textarea
                  name="summary"
                  rows="4"
                  placeholder="Briefly describe what you want to create in your own language"
                  required
                  minLength={10}
                  maxLength={3000}
                  onChange={markFormStarted}
                />
              </label>

              <button type="submit" className="reserve-now-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              {submitError ? <p className="inquiry-submit-error">{submitError}</p> : null}
            </form>

            {isSubmitSuccessOpen ? (
              <div className="inquiry-success-overlay" onClick={() => setIsSubmitSuccessOpen(false)}>
                <div className="inquiry-success-popup" onClick={(event) => event.stopPropagation()}>
                  <div className="success-icon-stack" aria-hidden="true">
                    <span className="success-ring success-ring-large" />
                    <span className="success-ring success-ring-mid" />
                    <span className="success-ring success-ring-small">
                      <svg
                        className="success-check-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 12.5L9.2 16.7L19 7.2"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="inquiry-success-title">Success</p>
                  <p className="inquiry-success-desc">
                    We will share the detailed information with you shortly.
                  </p>
                  <button
                    type="button"
                    className="reserve-now-submit inquiry-success-continue"
                    onClick={() => {
                      setIsSubmitSuccessOpen(false)
                      setIsInquiryOpen(false)
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  )
}
