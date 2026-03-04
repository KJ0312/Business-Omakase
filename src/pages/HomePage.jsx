import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import AboutSection from '../components/AboutSection'
import HowItWorksSection from '../components/HowItWorksSection'
import ServicesSection from '../components/ServicesSection'
import ContactSection from '../components/ContactSection'
import RevealOnScroll from '../components/transition/RevealOnScroll'

const CENTER_IMAGE_SRC = '/main-hero.png?v=20260228'

export default function HomePage() {
  const aboutSectionRef = useRef(null)
  const howItWorksSectionRef = useRef(null)
  const servicesSectionRef = useRef(null)
  const contactSectionRef = useRef(null)
  const location = useLocation()

  const scrollToNextSection = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToServicesSection = () => {
    servicesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToHowItWorksSection = () => {
    howItWorksSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToContactSection = () => {
    contactSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (location.hash === '#contact') {
      contactSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    if (location.hash === '#how-it-works') {
      howItWorksSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    if (location.hash === '#services') {
      servicesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  return (
    <main className="home-scroll-container">
      <section className="home-section hero-section">
        <div className="hero-center-wrap introHeroReveal">
          <div className="center-visual-wrap">
            <img className="center-visual" src={CENTER_IMAGE_SRC} alt="Business Omakase visual" />
          </div>
          <div className="introLineRow">
            <span className="introLineLabel">Seoul × Geneva</span>
            <span className="introLineTrack" />
            <button
              type="button"
              className="introLineLabel introLineAction"
              onClick={scrollToNextSection}
              aria-label="Scroll to discover next section"
            >
              Scroll to Discover ↓
            </button>
          </div>
        </div>
      </section>

      <section className="home-section home-about-section" ref={aboutSectionRef}>
        <RevealOnScroll className="home-about-reveal">
          <AboutSection />
        </RevealOnScroll>
        <button
          type="button"
          className="about-scroll-hint"
          onClick={scrollToHowItWorksSection}
          aria-label="Scroll to how it works section"
        >
          <span>Scroll to Discover</span>
          <span className="about-scroll-arrow" aria-hidden="true">
            ↓
          </span>
        </button>
      </section>

      <HowItWorksSection firstSectionRef={howItWorksSectionRef} />

      <section className="home-section home-services-section" id="services" ref={servicesSectionRef}>
        <RevealOnScroll>
          <ServicesSection />
        </RevealOnScroll>
        <button
          type="button"
          className="about-scroll-hint"
          onClick={scrollToContactSection}
          aria-label="Scroll to contact section"
        >
          <span>Scroll to Discover</span>
          <span className="about-scroll-arrow" aria-hidden="true">
            ↓
          </span>
        </button>
      </section>

      <section className="home-section home-contact-section" id="contact" ref={contactSectionRef}>
        <RevealOnScroll>
          <ContactSection />
        </RevealOnScroll>
      </section>
    </main>
  )
}
