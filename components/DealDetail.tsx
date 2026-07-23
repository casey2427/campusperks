"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { collegeDiscounts, colleges, verificationLabels } from "@/data/mock-data";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import type {
  Business,
  College,
  Discount,
  VerificationStatus,
} from "@/types";
import { Icon } from "./Icon";
import { VerificationBadge } from "./VerificationBadge";

type DataSource = "database" | "mock";

type DiscountRow = {
  id: string;
  business_id: string;
  title: string;
  category: string;
  address: string;
  verification_status: string;
  last_checked_at: string | null;
  helpful_count: number | null;
  not_helpful_count: number | null;
  is_demo: boolean | null;
};

type DetailRow = {
  redemption_instructions: string | null;
  terms: string | null;
  verification_confidence: number | null;
  expires_at: string | null;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string | null;
};

type CollegeMappingRow = {
  college_id: string;
  distance_miles: number | string | null;
};

type CollegeRow = {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  location: string;
};

type SourceRow = {
  id: string;
  source_url: string | null;
  source_name: string | null;
  evidence_text: string | null;
  source_type: string | null;
  confidence_score: number | null;
  checked_at: string | null;
  is_active: boolean | null;
};

type DealDetailProps = {
  discountId: string;
  initialCollegeSlug?: string;
};

const businessColors = [
  "#6d4de8",
  "#0f766e",
  "#be185d",
  "#2563eb",
  "#c2410c",
  "#4f46e5",
  "#15803d",
  "#9333ea",
];

const categoryAccents: Record<string, string> = {
  "Food and drinks": "linear-gradient(135deg, #ede9fe, #dbeafe)",
  Fitness: "linear-gradient(135deg, #d1fae5, #e0f2fe)",
  Entertainment: "linear-gradient(135deg, #fce7f3, #f3e8ff)",
  Technology: "linear-gradient(135deg, #dbeafe, #eef2ff)",
  Travel: "linear-gradient(135deg, #ffedd5, #fef3c7)",
  Shopping: "linear-gradient(135deg, #ede9fe, #e0e7ff)",
  Beauty: "linear-gradient(135deg, #fce7f3, #ffe4e6)",
  Subscriptions: "linear-gradient(135deg, #e0e7ff, #ede9fe)",
};

function normalizeVerification(value: string): VerificationStatus {
  const normalized = value.replaceAll("_", "-") as VerificationStatus;
  return normalized in verificationLabels ? normalized : "pending-review";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function businessColor(id: string) {
  const total = Array.from(id).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return businessColors[total % businessColors.length];
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not checked yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not checked yet";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function fallbackDeal(id: string) {
  return collegeDiscounts.find((item) => item.id === id) ?? null;
}

export function DealDetail({
  discountId,
  initialCollegeSlug,
}: DealDetailProps) {
  const router = useRouter();
  const [deal, setDeal] = useState<Discount | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>("mock");
  const [user, setUser] = useState<User | null>(null);
  const [userVote, setUserVote] = useState<-1 | 1 | undefined>();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState("");
  const [actionError, setActionError] = useState("");
  const [reportReason, setReportReason] = useState(
    "Discount no longer offered",
  );
  const [reportDetails, setReportDetails] = useState("");
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDeal() {
      const previewDeal = fallbackDeal(discountId);
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        if (active) {
          setDeal(previewDeal);
          setCollege(
            colleges.find((item) => item.slug === initialCollegeSlug) ??
              colleges[0],
          );
          setLoading(false);
        }
        return;
      }

      try {
        const { data: discountData, error: discountError } = await supabase
          .from("discounts")
          .select(
            "id, business_id, title, category, address, verification_status, last_checked_at, helpful_count, not_helpful_count, is_demo",
          )
          .eq("id", discountId)
          .eq("status", "active")
          .maybeSingle();

        if (discountError) throw discountError;
        const discountRow = discountData as DiscountRow | null;

        if (!discountRow) {
          if (active) {
            setDeal(previewDeal);
            setCollege(
              colleges.find((item) => item.slug === initialCollegeSlug) ??
                colleges[0],
            );
            setLoading(false);
          }
          return;
        }

        const [
          businessResult,
          mappingResult,
          detailResult,
          sourceResult,
          authResult,
        ] = await Promise.all([
          supabase
            .from("businesses")
            .select("id, name, slug")
            .eq("id", discountRow.business_id)
            .maybeSingle(),
          supabase
            .from("discount_colleges")
            .select("college_id, distance_miles")
            .eq("discount_id", discountId),
          supabase
            .from("discounts")
            .select(
              "redemption_instructions, terms, verification_confidence, expires_at",
            )
            .eq("id", discountId)
            .maybeSingle(),
          supabase
            .from("discount_sources")
            .select(
              "id, source_url, source_name, evidence_text, source_type, confidence_score, checked_at, is_active",
            )
            .eq("discount_id", discountId)
            .eq("is_active", true)
            .order("checked_at", { ascending: false }),
          supabase.auth.getUser(),
        ]);

        if (businessResult.error) throw businessResult.error;
        const businessRow = businessResult.data as BusinessRow | null;
        if (!businessRow) throw new Error("The business could not be found.");

        const mappings =
          (mappingResult.data as CollegeMappingRow[] | null) ?? [];
        const collegeIds = mappings.map((item) => item.college_id);
        let collegeRows: CollegeRow[] = [];

        if (collegeIds.length > 0) {
          const { data } = await supabase
            .from("colleges")
            .select("id, name, short_name, slug, location")
            .in("id", collegeIds);
          collegeRows = (data as CollegeRow[] | null) ?? [];
        }

        const selectedCollege =
          collegeRows.find((item) => item.slug === initialCollegeSlug) ??
          [...collegeRows].sort((a, b) => {
            const aDistance = Number(
              mappings.find((item) => item.college_id === a.id)
                ?.distance_miles ?? Number.POSITIVE_INFINITY,
            );
            const bDistance = Number(
              mappings.find((item) => item.college_id === b.id)
                ?.distance_miles ?? Number.POSITIVE_INFINITY,
            );
            return aDistance - bDistance;
          })[0];
        const selectedMapping = mappings.find(
          (item) => item.college_id === selectedCollege?.id,
        );
        const business: Business = {
          id: businessRow.id,
          name: businessRow.name,
          slug: businessRow.slug ?? businessRow.id,
          initials: initials(businessRow.name),
          color: businessColor(businessRow.id),
        };
        const detail = detailResult.data as DetailRow | null;
        const mappedDeal: Discount = {
          id: discountRow.id,
          business,
          title: discountRow.title,
          category: discountRow.category,
          address: discountRow.address,
          distance:
            selectedMapping?.distance_miles == null
              ? "Distance unavailable"
              : `${Number(selectedMapping.distance_miles).toFixed(1)} mi`,
          verificationStatus: normalizeVerification(
            discountRow.verification_status,
          ),
          lastChecked: formatDate(discountRow.last_checked_at),
          accent:
            categoryAccents[discountRow.category] ??
            "linear-gradient(135deg, #ede9fe, #dbeafe)",
          helpfulCount: discountRow.helpful_count ?? 0,
          notHelpfulCount: discountRow.not_helpful_count ?? 0,
          isDemo: discountRow.is_demo ?? false,
          redemptionInstructions:
            detail?.redemption_instructions ?? null,
          terms: detail?.terms ?? null,
          verificationConfidence:
            detail?.verification_confidence ?? null,
          expiresAt: detail?.expires_at ?? null,
        };
        const currentUser = authResult.data.user;

        if (!active) return;
        setDeal(mappedDeal);
        setDataSource("database");
        setSources(
          sourceResult.error
            ? []
            : ((sourceResult.data as SourceRow[] | null) ?? []),
        );
        setUser(currentUser);
        setCollege(
          selectedCollege
            ? {
                id: selectedCollege.id,
                name: selectedCollege.name,
                shortName: selectedCollege.short_name,
                slug: selectedCollege.slug,
                location: selectedCollege.location,
                latitude: 0,
                longitude: 0,
              }
            : null,
        );

        if (currentUser) {
          const [{ data: voteData }, { data: saveData }] = await Promise.all([
            supabase
              .from("votes")
              .select("value")
              .eq("user_id", currentUser.id)
              .eq("discount_id", discountId)
              .maybeSingle(),
            supabase
              .from("saves")
              .select("discount_id")
              .eq("user_id", currentUser.id)
              .eq("discount_id", discountId)
              .maybeSingle(),
          ]);

          if (!active) return;
          if (voteData?.value === 1 || voteData?.value === -1) {
            setUserVote(voteData.value);
          }
          setSaved(Boolean(saveData));
        }
      } catch {
        if (active) {
          setDeal(previewDeal);
          setCollege(
            colleges.find((item) => item.slug === initialCollegeSlug) ??
              colleges[0],
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDeal();
    return () => {
      active = false;
    };
  }, [discountId, initialCollegeSlug]);

  const returnHref = college ? `/colleges/${college.slug}` : "/discounts";
  const loginHref = `/login?next=${encodeURIComponent(
    `/discounts/${discountId}${
      college ? `?college=${college.slug}` : ""
    }`,
  )}`;
  const confidenceLabel = useMemo(() => {
    if (deal?.verificationConfidence == null) return "Not scored yet";
    if (deal.verificationConfidence >= 80) return "High confidence";
    if (deal.verificationConfidence >= 55) return "Moderate confidence";
    return "Low confidence";
  }, [deal?.verificationConfidence]);

  function requireLogin() {
    router.push(loginHref);
  }

  async function handleVote(value: -1 | 1) {
    if (!user) {
      requireLogin();
      return;
    }
    if (!deal || dataSource !== "database") return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const previousVote = userVote;
    setActionBusy("vote");
    setActionError("");
    const result =
      previousVote === value
        ? await supabase
            .from("votes")
            .delete()
            .eq("user_id", user.id)
            .eq("discount_id", discountId)
        : await supabase.from("votes").upsert(
            { user_id: user.id, discount_id: discountId, value },
            { onConflict: "user_id,discount_id" },
          );

    if (result.error) {
      setActionError(result.error.message);
      setActionBusy("");
      return;
    }

    let helpfulCount = deal.helpfulCount ?? 0;
    let notHelpfulCount = deal.notHelpfulCount ?? 0;
    if (previousVote === 1) helpfulCount = Math.max(0, helpfulCount - 1);
    if (previousVote === -1) {
      notHelpfulCount = Math.max(0, notHelpfulCount - 1);
    }
    if (previousVote !== value) {
      if (value === 1) helpfulCount += 1;
      else notHelpfulCount += 1;
    }
    setDeal({ ...deal, helpfulCount, notHelpfulCount });
    setUserVote(previousVote === value ? undefined : value);
    setActionBusy("");
  }

  async function handleSave() {
    if (!user) {
      requireLogin();
      return;
    }
    if (dataSource !== "database") return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setActionBusy("save");
    setActionError("");
    const result = saved
      ? await supabase
          .from("saves")
          .delete()
          .eq("user_id", user.id)
          .eq("discount_id", discountId)
      : await supabase
          .from("saves")
          .insert({ user_id: user.id, discount_id: discountId });

    if (result.error) setActionError(result.error.message);
    else setSaved(!saved);
    setActionBusy("");
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      requireLogin();
      return;
    }
    if (dataSource !== "database") return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setActionBusy("report");
    setActionError("");
    const { error } = await supabase.from("deal_reports").insert({
      discount_id: discountId,
      reported_by: user.id,
      reason: reportReason,
      details: reportDetails.trim() || null,
    });

    if (error) {
      setActionError(
        error.message.includes("deal_reports")
          ? "The report system needs its one-time database setup."
          : error.message,
      );
    } else {
      setReportSent(true);
      setReportDetails("");
    }
    setActionBusy("");
  }

  if (loading) {
    return (
      <section className="deal-detail-state" role="status">
        <span className="account-loading-spinner" />
        Loading discount details…
      </section>
    );
  }

  if (!deal) {
    return (
      <section className="deal-detail-state">
        <span className="account-state-icon">
          <Icon name="search" size={27} />
        </span>
        <h1>Discount not found</h1>
        <p>This listing may have been removed or the link may be incorrect.</p>
        <Link className="button button-primary" href="/discounts">
          Browse discounts
        </Link>
      </section>
    );
  }

  const primarySource = sources[0];

  return (
    <div className="deal-detail-page">
      <section className="deal-detail-hero">
        <div className="container">
          <Link className="deal-detail-back" href={returnHref}>
            <Icon name="chevron" size={16} />
            Back to {college?.shortName ?? "discounts"}
          </Link>
          <div className="deal-detail-hero-grid">
            <div
              className="deal-detail-logo-wrap"
              style={{ background: deal.accent }}
            >
              {(deal.isDemo ?? true) && (
                <span className="deal-demo-label">Demo data</span>
              )}
              <span
                className="deal-detail-logo"
                style={{ backgroundColor: deal.business.color }}
                aria-hidden="true"
              >
                {deal.business.initials}
              </span>
            </div>
            <div className="deal-detail-title">
              <span className="eyebrow">{deal.category}</span>
              <p>{deal.business.name}</p>
              <h1>{deal.title}</h1>
              <div className="deal-detail-badges">
                <VerificationBadge status={deal.verificationStatus} />
                {deal.isDemo && <span className="detail-demo-pill">Demo listing</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container deal-detail-shell">
        <div className="deal-detail-main">
          {deal.verificationStatus === "possibly-outdated" && (
            <div className="deal-outdated-warning" role="note">
              <Icon name="flag" size={19} />
              <div>
                <strong>This deal may be outdated</strong>
                <p>Check with the business before making a special trip.</p>
              </div>
            </div>
          )}

          <section className="deal-detail-card">
            <span className="eyebrow">How to use this deal</span>
            <h2>Redemption instructions</h2>
            <p>
              {deal.redemptionInstructions ??
                "Bring a valid college student ID and ask the business to confirm the offer before purchase."}
            </p>
            <dl className="deal-facts-grid">
              <div>
                <dt>Address</dt>
                <dd>{deal.address}</dd>
              </div>
              <div>
                <dt>Campus distance</dt>
                <dd>{deal.distance}</dd>
              </div>
              <div>
                <dt>Expiration</dt>
                <dd>
                  {deal.expiresAt ? formatDate(deal.expiresAt) : "Not listed"}
                </dd>
              </div>
              <div>
                <dt>Last checked</dt>
                <dd>{deal.lastChecked}</dd>
              </div>
            </dl>
            <div className="deal-terms">
              <strong>Terms</strong>
              <p>
                {deal.terms ??
                  "Student eligibility and participating locations may vary. Confirm details with the business."}
              </p>
            </div>
          </section>

          <section className="deal-detail-card">
            <span className="eyebrow">Evidence and transparency</span>
            <h2>Why CampusPerks shows this verification</h2>
            <div className="deal-confidence-row">
              <div>
                <span>Verification status</span>
                <VerificationBadge status={deal.verificationStatus} />
              </div>
              <div>
                <span>Confidence</span>
                <strong>{confidenceLabel}</strong>
                {deal.verificationConfidence != null && (
                  <small>{deal.verificationConfidence}% evidence confidence</small>
                )}
              </div>
            </div>

            {primarySource ? (
              <article className="deal-source-card">
                <div>
                  <span className="deal-source-type">
                    {primarySource.source_type ?? "Verification source"}
                  </span>
                  <h3>{primarySource.source_name ?? "Supporting source"}</h3>
                </div>
                <p>
                  {primarySource.evidence_text ??
                    "This source was reviewed for evidence supporting the listing."}
                </p>
                <div className="deal-source-footer">
                  <span>Checked {formatDate(primarySource.checked_at)}</span>
                  {primarySource.source_url && (
                    <a
                      href={primarySource.source_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open source <Icon name="arrow-right" size={14} />
                    </a>
                  )}
                </div>
              </article>
            ) : (
              <div className="deal-source-empty">
                <Icon name="shield" size={22} />
                <div>
                  <strong>No source evidence attached yet</strong>
                  <p>
                    The future daily verification scan can attach official
                    sources here. CampusPerks does not invent a confidence
                    score when evidence is missing.
                  </p>
                </div>
              </div>
            )}

            <p className="deal-verification-note">
              Verification is evidence-based, but availability can still
              change by location. Community reports go to an administrator
              before a listing changes.
            </p>
          </section>

          <section className="deal-detail-card report-deal-card" id="report-deal">
            <span className="eyebrow">Keep CampusPerks accurate</span>
            <h2>Report an outdated or incorrect deal</h2>
            <p>
              Your report goes to a private review queue. It does not
              automatically remove the listing.
            </p>

            {reportSent ? (
              <div className="report-success" role="status">
                <Icon name="check" size={22} />
                <div>
                  <strong>Report received</strong>
                  <p>Thank you. An administrator can now review this deal.</p>
                </div>
              </div>
            ) : user ? (
              <form className="report-form" onSubmit={submitReport}>
                <label>
                  <span>What is wrong?</span>
                  <select
                    onChange={(event) => setReportReason(event.target.value)}
                    value={reportReason}
                  >
                    <option>Discount no longer offered</option>
                    <option>Details are incorrect</option>
                    <option>Business is closed or moved</option>
                    <option>Could not redeem</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  <span>Details (optional)</span>
                  <textarea
                    onChange={(event) => setReportDetails(event.target.value)}
                    placeholder="Tell us what happened or what should be updated."
                    rows={4}
                    value={reportDetails}
                  />
                </label>
                <button
                  className="button secondary-button"
                  disabled={actionBusy === "report"}
                  type="submit"
                >
                  <Icon name="flag" size={16} />
                  {actionBusy === "report" ? "Sending…" : "Send report"}
                </button>
              </form>
            ) : (
              <div className="report-login-prompt">
                <p>Log in so we can prevent duplicate and anonymous reports.</p>
                <Link className="button secondary-button" href={loginHref}>
                  Log in to report
                </Link>
              </div>
            )}
          </section>
        </div>

        <aside className="deal-detail-sidebar">
          <div className="deal-detail-card deal-action-card">
            <span className="eyebrow">Student feedback</span>
            <h2>Was this deal helpful?</h2>
            <div className="deal-detail-votes">
              <button
                aria-pressed={userVote === 1}
                className={userVote === 1 ? "active" : ""}
                disabled={Boolean(actionBusy)}
                onClick={() => handleVote(1)}
                type="button"
              >
                <Icon name="thumb-up" size={18} />
                <span>Helpful</span>
                <strong>{deal.helpfulCount ?? 0}</strong>
              </button>
              <button
                aria-pressed={userVote === -1}
                className={userVote === -1 ? "active" : ""}
                disabled={Boolean(actionBusy)}
                onClick={() => handleVote(-1)}
                type="button"
              >
                <Icon name="thumb-down" size={18} />
                <span>Not helpful</span>
                <strong>{deal.notHelpfulCount ?? 0}</strong>
              </button>
            </div>
            <button
              aria-pressed={saved}
              className={`button deal-save-button ${saved ? "saved" : ""}`}
              disabled={Boolean(actionBusy)}
              onClick={handleSave}
              type="button"
            >
              <Icon name="heart" size={18} />
              {saved ? "Saved to your account" : "Save this deal"}
            </button>
            {!user && (
              <p className="deal-action-hint">Log in to vote or save.</p>
            )}
            {dataSource === "mock" && !isSupabaseConfigured() && (
              <p className="deal-action-hint">
                Preview data is read-only until the database is connected.
              </p>
            )}
            {actionError && (
              <p className="form-error-message" role="alert">
                {actionError}
              </p>
            )}
          </div>

          <div className="deal-detail-card deal-community-note">
            <Icon name="shield" size={21} />
            <div>
              <strong>Community-ranked, evidence-aware</strong>
              <p>
                Helpful votes affect ranking, while verification evidence and
                freshness remain the strongest signals.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
