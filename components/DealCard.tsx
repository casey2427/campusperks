"use client";

import { useState } from "react";
import type { Discount } from "@/types";
import { Icon } from "./Icon";
import { VerificationBadge } from "./VerificationBadge";

export function DealCard({ discount }: { discount: Discount }) {
  const [favorite, setFavorite] = useState(false);

  return (
    <article className="deal-card">
      <div className="deal-visual" style={{ background: discount.accent }}>
        <span className="deal-demo-label">Demo data</span>
        <span
          className="business-logo"
          style={{ backgroundColor: discount.business.color }}
          aria-hidden="true"
        >
          {discount.business.initials}
        </span>
        <button
          aria-label={
            favorite
              ? `Remove ${discount.business.name} from favorites`
              : `Add ${discount.business.name} to favorites`
          }
          aria-pressed={favorite}
          className={`favorite-button ${favorite ? "favorite" : ""}`}
          onClick={() => setFavorite((value) => !value)}
          type="button"
        >
          <Icon name="heart" size={18} />
        </button>
      </div>
      <div className="deal-content">
        <div className="deal-business-row">
          <span>{discount.business.name}</span>
          <span className="deal-distance">{discount.distance}</span>
        </div>
        <h3>{discount.title}</h3>
        <p className="deal-meta">{discount.category} · {discount.address}</p>
        <VerificationBadge status={discount.verificationStatus} />
        <p className="last-checked">
          <Icon name="clock" size={14} /> Last checked {discount.lastChecked}
        </p>
        <a className="button deal-button" href={`/discounts/${discount.id}`}>
          View Deal <Icon name="arrow-right" size={16} />
        </a>
        <a className="report-link" href={`/report/${discount.id}`}>
          <Icon name="flag" size={13} /> Report outdated deal
        </a>
      </div>
    </article>
  );
}
