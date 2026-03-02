export default function AboutSection() {
  return (
    <section className="about-section heroSplit">
      <div className="heroImageWrap">
        <img className="heroImage" src="/About Us.png" alt="Business Omakase" />
      </div>

      <div className="heroText">
        <h1 className="heroTitle">Welcome to Business Omakase.</h1>

        <div className="heroBody">
          <p>
            Business Omakase is a cross-border development studio based in Seoul and
            Geneva.
          </p>
          <p>
            Like the Japanese omakase experience, we do not offer predefined products.
          </p>
          <p>
            Instead, we carefully understand each client's direction and pace, and design
            the most effective path to execution.
          </p>
          <p>
            From structuring ideas to delivering execution, we transform vision into real
            opportunities - grounded in trust and built for ambitious individuals and
            organizations.
          </p>
        </div>

        <p className="heroClosing">
          Tell us what exists in your mind, we will turn it into reality.
        </p>
      </div>
    </section>
  )
}
