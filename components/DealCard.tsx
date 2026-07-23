"use client";

import { useState } from "react";
import type { Discount } from "@/types";
import { Icon } from "./Icon";
import { VerificationBadge } from "./VerificationBadge";

type DealCardProps = {
  discount: Discount;
  userVote?: -1 | 1;
  saved?: boolean;
  busy?: boolean;
  onVote?: (value: -1 | 1) => void;
  onSave?: () => void;
};

export function DealCard({
  discount,
  userVote,
  saved,
  busy = false,
  onVote,
  onSave,
}: DealCardProps) {
  const [favorite, setFavorite] = useState(false);
  const isSaved = saved ?? favorite;

  function handleSave() {
    if (onSave) {
      onSave();
      return;
    }

    setFavorite((value) => !value);
  }

  return (
    <article className="deal-card">
      <div className="deal-visual" style={{ background: discount.accent }}>
        {(discount.isDemo ?? true) && (
          <span className="deal-demo-label">Demo data</span>
        )}
        <span
          className="business-logo"
          style={{ backgroundColor: discount.business.color }}
          aria-hidden="true"
        >
          {discount.business.initials}
        </span>
        <button
          aria-label={
            isSaved
              ? `Remove ${discount.business.name} from favorites`
              : `Add ${discount.business.name} to favorites`
          }
          aria-pressed={isSaved}
          className={`favorite-button ${isSaved ? "favorite" : ""}`}
          disabled={busy}
          onClick={handleSave}
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
        {onVote && (
          <div className="deal-vote-row" aria-label="Was this discount helpful?">
            <button
              aria-pressed={userVote === 1}
              className={`deal-vote-button helpful ${
                userVote === 1 ? "active" : ""
              }`}
              disabled={busy}
              onClick={() => onVote(1)}
              type="button"
            >
              <Icon name="thumb-up" size={15} />
              Helpful
              <span>{discount.helpfulCount ?? 0}</span>
            </button>
            <button
              aria-pressed={userVote === -1}
              className={`deal-vote-button not-helpful ${
                userVote === -1 ? "active" : ""
              }`}
              disabled={busy}
              onClick={() => onVote(-1)}
              type="button"
            >
              <Icon name="thumb-down" size={15} />
              Not helpful
              <span>{discount.notHelpfulCount ?? 0}</span>
            </button>
          </div>
        )}
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
