import { Icon } from "./Icon";

const steps = [
  {
    number: "01",
    title: "Search your college",
    description: "Enter your college or allow location access.",
    icon: "search",
  },
  {
    number: "02",
    title: "Discover nearby deals",
    description:
      "Browse student discounts by distance, category, and verification status.",
    icon: "pin",
  },
  {
    number: "03",
    title: "Save and contribute",
    description:
      "Use the deal and submit discounts that other students should know about.",
    icon: "heart",
  },
];

export function HowItWorks() {
  return (
    <section
      className="how-section section-anchor"
      id="how-it-works"
      aria-labelledby="how-heading"
    >
      <div className="container">
        <div className="section-heading-centered">
          <p className="section-kicker">Simple from the start</p>
          <h2 id="how-heading">How CampusPerks works</h2>
          <p>
            Find useful student savings in just a few steps—without paying a
            membership fee.
          </p>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <article className="step-card" key={step.number}>
              <div className="step-topline">
                <span className="step-icon"><Icon name={step.icon} size={23} /></span>
                <span className="step-number">{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < steps.length - 1 && (
                <span className="step-connector" aria-hidden="true">
                  <Icon name="arrow-right" size={18} />
                </span>
              )}
            </article>
          ))}
        </div>
        <div className="centered-action">
          <a className="button button-primary section-button" href="#college-search">
            Find discounts near me <Icon name="arrow-right" size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
