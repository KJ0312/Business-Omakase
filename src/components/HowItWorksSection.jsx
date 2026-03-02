import { useState } from 'react'

export default function HowItWorksSection({ firstSectionRef }) {
  const [isGridActive, setIsGridActive] = useState(false)

  const aiAgents = [
    'Product Manager',
    'UI/UX Designer',
    'Frontend Builder',
    'Backend Builder',
    'Workspace Assistant',
    'System Architect',
    'Quality Assistance',
    'Infra Manager',
  ]

  const flowSteps = [
    'Inquiry',
    'Alignment Meeting',
    'AI Workspace Activation',
    'Build & Interaction',
    'Launch & Handover',
    'Maintenance',
  ]

  return (
    <section ref={firstSectionRef} id="how-it-works" className="home-section howitworks-layout-section">
      <div className="how-layout-shell">
        <header className="how-layer-intro how-reveal">
          <p className="how-layout-label">How it works</p>
          <h2 className="how-layout-headline">AI-Driven Digital Studio</h2>
          <p className="how-layout-subheadline">
            An AI-driven digital studio powered by top-tier Korean development expertise. You don&apos;t need a
            CTO anymore. From idea to launch, Business Omakase works alongside you.
          </p>
        </header>

        <div className="how-layer-system how-reveal">
          <aside className="how-layout-left-flow">
            <h3 className="how-layout-timeline-badge">Workflow: A One-Month Delivery Timeline</h3>
            <ul className="how-layout-flow-list">
              {flowSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <p className="how-layout-flow-note">Delivery timelines may vary depending on project scope.</p>
          </aside>

          <div className="how-layout-right-panel">
            <div className={`how-layout-studio-box ${isGridActive ? 'is-grid-active' : ''}`}>
              <h3 className="how-layout-operating-badge">AI Studio Structure: 8 Specialized AI Agents</h3>
              <div className="how-layout-block-grid">
                <div className="how-layout-feature-grid">
                  <p>✓ From Idea to Launch</p>
                  <p>✓ 24/7 AI Collaboration</p>
                  <p>✓ No Hiring Required</p>
                  <p>✓ Faster Execution</p>
                </div>
                <div
                  className="how-layout-agent-grid"
                  onMouseEnter={() => setIsGridActive(true)}
                  onMouseLeave={() => setIsGridActive(false)}
                >
                  {aiAgents.map((agent) => (
                    <article key={agent} className="how-node">
                      {agent}
                    </article>
                  ))}
                </div>
              </div>
              <p className="how-layout-studio-note">AI continuously operates under human supervision.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
