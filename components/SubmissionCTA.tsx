import Link from "next/link";
import { Icon } from "./Icon";

export function SubmissionCTA() {
  return (
    <section className="submission-section" aria-labelledby="submission-heading">
      <div className="container submission-card">
        <div className="cta-icon-cluster" aria-hidden="true">
          <span><Icon name="tag" size={30} /></span>
          <span><Icon name="sparkles" size={18} /></span>
        </div>
        <div className="cta-copy">
          <p className="section-kicker">Built with students</p>
          <h2 id="submission-heading">Know a student discount we missed?</h2>
          <p>
            Help other students save by submitting a discount you found near
            campus.
          </p>
        </div>
        <Link className="button button-primary cta-button" href="/submit-discount">
          Submit a Discount <Icon name="arrow-right" size={18} />
        </Link>
      </div>
    </section>
  );
}
