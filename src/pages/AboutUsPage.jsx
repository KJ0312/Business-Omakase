import { Link } from 'react-router-dom'
import AboutSection from '../components/AboutSection'
import RevealOnScroll from '../components/transition/RevealOnScroll'

export default function AboutUsPage() {
  return (
    <main className="about-page">
      <RevealOnScroll>
        <AboutSection />
      </RevealOnScroll>
      <Link className="about-page-next-link" to="/service">
        Services&rarr;
      </Link>
    </main>
  )
}
