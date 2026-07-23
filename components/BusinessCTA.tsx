import { Icon } from "./Icon";

export function BusinessCTA() {
  return (
    <section
      className="business-section section-anchor"
      id="for-businesses"
      aria-labelledby="business-heading"
    >
      <div className="container business-card">
        <div className="business-content">
          <p className="section-kicker">For local businesses</p>
          <h2 id="business-heading">Reach more students near your business</h2>
          <p>
            CampusPerks will let businesses submit, claim, and manage student
            offers—all in one simple place.
          </p>
          <a className="button button-primary cta-button" href="/for-businesses">
            List Your Business <Icon name="arrow-right" size={18} />
          </a>
        </div>
        <div className="business-preview" aria-hidden="true">
          <div className="preview-card preview-card-back">
            <span className="preview-dot" />
            <span className="preview-line short" />
            <span className="preview-line" />
          </div>
          <div className="preview-card preview-card-front">
            <span className="preview-badge"><Icon name="shield" size={14} /> Verified</span>
            <span className="preview-shop"><Icon name="bag" size={25} /></span>
            <span className="preview-line short" />
            <span className="preview-line" />
            <span className="preview-button" />
          </div>
        </div>
      </div>
    </section>
  );
}
