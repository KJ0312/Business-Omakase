import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import AboutUsPage from './pages/AboutUsPage'
import ServicePage from './pages/ServicePage'
import ContactUsPage from './pages/ContactUsPage'
import PageTransition from './components/transition/PageTransition'
import DoorTransition from './components/transition/DoorTransition'
import { MOTION } from './styles/motion'
import { bootstrapTracking, flushTrackingOnExit, trackPageView } from './lib/tracking'

export default function App() {
  const location = useLocation()
  const previousPathRef = useRef(location.pathname)
  const [isDoorActive, setIsDoorActive] = useState(false)

  useEffect(() => {
    let dispose = () => {}
    bootstrapTracking().then((cleanup) => {
      dispose = cleanup
    })

    const onUnload = () => {
      flushTrackingOnExit()
    }

    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('beforeunload', onUnload)
      dispose()
    }
  }, [])

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    if (previousPathRef.current === location.pathname) {
      return
    }

    previousPathRef.current = location.pathname
    setIsDoorActive(true)
    const timer = window.setTimeout(() => setIsDoorActive(false), MOTION.door.durationMs)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="app-shell">
      <Header />
      <DoorTransition isActive={isDoorActive} />
      <Routes location={location}>
        <Route
          path="/"
          element={
            <PageTransition className="introPageTransition">
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/aboutus"
          element={
            <PageTransition>
              <AboutUsPage />
            </PageTransition>
          }
        />
        <Route
          path="/service"
          element={
            <PageTransition>
              <ServicePage />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <ContactUsPage />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
