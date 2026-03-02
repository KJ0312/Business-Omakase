const serviceCards = [
  {
    index: '01',
    label: 'Signature — New Development',
    description:
      'We turn ideas into real, working products. From concept to execution, we design and build new digital services for individuals and organizations ready to create something new.',
    scopeColumns: [
      [
        'New digital services & platforms',
        'Website & SaaS development',
        'AI tools & AI model development',
      ],
      [
        'Custom programs & systems',
        'Blockchain-based solutions',
        'Admin panels and intranet systems',
      ],
    ],
    recommendedColumns: [
      {
        heading: 'Individuals:',
        items: ['Personal Projects', 'Professionals', 'Aspiring Founders'],
      },
      {
        heading: 'Organizations:',
        items: [
          'Startups',
          'New Ventures',
          'Family Business Companies',
          'Launching New Initiatives',
        ],
      },
    ],
  },
  {
    index: '02',
    label: 'Twist — Maintenance & Upgrade',
    description:
      'We refine and upgrade what already exists. By analyzing current systems and integrating AI and automation, we redesign operations for higher performance and efficiency.',
    scopeColumns: [
      [
        'Website enhancement & optimization',
        'Data analytics & operational improvement',
        'Marketing automation',
      ],
      [
        'Workflow automation systems',
        'AI integration for productivity',
        'Cost reduction & operational efficiency',
      ],
    ],
    recommendedColumns: [
      {
        heading: 'Individuals:',
        items: ['Solo Founders', 'Digital Nomads', 'Influencers'],
      },
      {
        heading: 'Organizations:',
        items: [
          'Early-Stage Startups, SMEs',
          'Family Businesses In Transition',
          'No In-House Tech Team',
          'Outsourced Operations',
        ],
      },
    ],
  },
]

export default function ServicesSection() {
  return (
    <section className="services-stage services-stagger-stage">
      <div className="services-shell">
        <header className="services-intro">
          <p className="services-intro-label">WHAT WE PROVIDE</p>
          <h2 className="services-intro-headline">Personalized Service</h2>
          <p className="services-intro-subheadline">
            High-quality outcomes tailored to each client&apos;s vision and purpose. All services are delivered
            without limitation on geography, language, industry, or organizational scale.
          </p>
        </header>

        <div className="services-cards-grid">
          {serviceCards.map((card, index) => (
            <article
              className="service-card-col service-card-reveal"
              style={{ '--stagger-delay': `${160 * index}ms` }}
              key={card.label}
            >
              <div className="service-card">
                <div className="service-card-body">
                  <div className="service-zone service-zone-title">
                    <header className="service-card-header">
                      <p className="service-title-badge">{card.label}</p>
                      <span className="service-index-pill">{card.index}</span>
                    </header>
                    <p className="service-description">{card.description}</p>
                  </div>

                  <div className="service-zone service-zone-scope">
                    <div className="service-section-block service-module service-module-scope">
                      <span className="service-section-badge">Service Scope</span>
                      <div className="service-two-col-grid">
                        {card.scopeColumns.map((column, index) => (
                          <ul className="service-list" key={`${card.label}-scope-${index}`}>
                            {column.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="service-zone service-zone-recommended">
                    <div className="service-section-block service-module service-module-recommended">
                      <span className="service-section-badge">Recommended For</span>
                      <div className="service-two-col-grid service-recommended-grid">
                        {card.recommendedColumns.map((item) => (
                          <div className="service-recommended-col" key={`${card.label}-${item.heading}`}>
                            <h4>{item.heading}</h4>
                            <ul className="service-recommended-list">
                              {item.items.map((listItem) => (
                                <li key={listItem}>{listItem}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
