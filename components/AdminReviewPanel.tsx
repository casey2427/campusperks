"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Icon } from "./Icon";

type ReviewStatus = "pending" | "approved" | "rejected";
type ReportStatus = "pending" | "resolved" | "dismissed";
type QueueView = "submissions" | "reports";

type Submission = {
  id: string;
  submitted_by: string;
  college_id: string;
  business_name: string;
  discount_title: string;
  category: string;
  address: string;
  source: string;
  notes: string | null;
  status: ReviewStatus;
  admin_notes: string | null;
  published_discount_id: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type CollegeRow = {
  id: string;
  name: string;
  short_name: string;
};

type DealReport = {
  id: string;
  discount_id: string;
  reported_by: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type DiscountRow = {
  id: string;
  business_id: string;
  title: string;
  verification_status: string;
};

type BusinessRow = {
  id: string;
  name: string;
};

function formatDate(value: string | null) {
  if (!value) return "recently";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  return status.replaceAll("-", " ");
}

export function AdminReviewPanel() {
  const [user, setUser] = useState<User | null>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [queueView, setQueueView] = useState<QueueView>("submissions");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reports, setReports] = useState<DealReport[]>([]);
  const [colleges, setColleges] = useState<Map<string, CollegeRow>>(new Map());
  const [discounts, setDiscounts] = useState<Map<string, DiscountRow>>(new Map());
  const [businesses, setBusinesses] = useState<Map<string, BusinessRow>>(
    new Map(),
  );
  const [submissionFilter, setSubmissionFilter] = useState<
    "all" | ReviewStatus
  >("pending");
  const [reportFilter, setReportFilter] = useState<"all" | ReportStatus>(
    "pending",
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQueue() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setError("CampusPerks could not connect to the database.");
        setLoading(false);
        return;
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        setError(
          profileError.message.includes("is_admin")
            ? "The admin database setup has not been run yet."
            : profileError.message,
        );
        setLoading(false);
        return;
      }

      if (!profile?.is_admin) {
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      const [submissionResult, collegeResult, reportResult] = await Promise.all([
        supabase
          .from("discount_submissions")
          .select(
            "id, submitted_by, college_id, business_name, discount_title, category, address, source, notes, status, admin_notes, published_discount_id, created_at, reviewed_at",
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("colleges")
          .select("id, name, short_name")
          .order("name"),
        supabase
          .from("deal_reports")
          .select(
            "id, discount_id, reported_by, reason, details, status, admin_notes, created_at, reviewed_at",
          )
          .order("created_at", { ascending: false }),
      ]);

      if (submissionResult.error) {
        setError(submissionResult.error.message);
      } else {
        setSubmissions(
          (submissionResult.data as Submission[] | null) ?? [],
        );
      }
      setColleges(
        new Map(
          ((collegeResult.data as CollegeRow[] | null) ?? []).map((item) => [
            item.id,
            item,
          ]),
        ),
      );

      if (!reportResult.error) {
        const reportRows =
          (reportResult.data as DealReport[] | null) ?? [];
        setReports(reportRows);
        const discountIds = [
          ...new Set(reportRows.map((item) => item.discount_id)),
        ];

        if (discountIds.length > 0) {
          const { data: discountData } = await supabase
            .from("discounts")
            .select("id, business_id, title, verification_status")
            .in("id", discountIds);
          const discountRows =
            (discountData as DiscountRow[] | null) ?? [];
          setDiscounts(
            new Map(discountRows.map((item) => [item.id, item])),
          );

          const businessIds = [
            ...new Set(discountRows.map((item) => item.business_id)),
          ];
          if (businessIds.length > 0) {
            const { data: businessData } = await supabase
              .from("businesses")
              .select("id, name")
              .in("id", businessIds);
            setBusinesses(
              new Map(
                ((businessData as BusinessRow[] | null) ?? []).map((item) => [
                  item.id,
                  item,
                ]),
              ),
            );
          }
        }
      }

      setLoading(false);
    }

    loadQueue();
  }, []);

  const submissionCounts = useMemo(
    () => ({
      all: submissions.length,
      pending: submissions.filter((item) => item.status === "pending").length,
      approved: submissions.filter((item) => item.status === "approved").length,
      rejected: submissions.filter((item) => item.status === "rejected").length,
    }),
    [submissions],
  );
  const reportCounts = useMemo(
    () => ({
      all: reports.length,
      pending: reports.filter((item) => item.status === "pending").length,
      resolved: reports.filter((item) => item.status === "resolved").length,
      dismissed: reports.filter((item) => item.status === "dismissed").length,
    }),
    [reports],
  );
  const filteredSubmissions =
    submissionFilter === "all"
      ? submissions
      : submissions.filter((item) => item.status === submissionFilter);
  const filteredReports =
    reportFilter === "all"
      ? reports
      : reports.filter((item) => item.status === reportFilter);

  async function reviewSubmission(
    submissionId: string,
    decision: "approved" | "rejected",
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusyId(submissionId);
    setError("");

    const { data: publishedId, error: reviewError } = await supabase.rpc(
      "review_discount_submission",
      {
        p_submission_id: submissionId,
        p_decision: decision,
        p_admin_notes: notes[submissionId]?.trim() || null,
      },
    );

    if (reviewError) {
      setError(reviewError.message);
    } else {
      setSubmissions((current) =>
        current.map((item) =>
          item.id === submissionId
            ? {
                ...item,
                status: decision,
                admin_notes: notes[submissionId]?.trim() || null,
                published_discount_id:
                  decision === "approved"
                    ? String(publishedId ?? "")
                    : item.published_discount_id,
                reviewed_at: new Date().toISOString(),
              }
            : item,
        ),
      );
    }
    setBusyId("");
  }

  async function reviewReport(
    reportId: string,
    decision: "possibly-outdated" | "dismissed",
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusyId(reportId);
    setError("");

    const { error: reviewError } = await supabase.rpc("review_deal_report", {
      p_report_id: reportId,
      p_decision: decision,
      p_admin_notes: notes[reportId]?.trim() || null,
    });

    if (reviewError) {
      setError(reviewError.message);
    } else {
      const report = reports.find((item) => item.id === reportId);
      setReports((current) =>
        current.map((item) =>
          item.id === reportId
            ? {
                ...item,
                status: decision === "dismissed" ? "dismissed" : "resolved",
                admin_notes: notes[reportId]?.trim() || null,
                reviewed_at: new Date().toISOString(),
              }
            : item,
        ),
      );
      if (decision === "possibly-outdated" && report) {
        setDiscounts((current) => {
          const next = new Map(current);
          const discount = next.get(report.discount_id);
          if (discount) {
            next.set(report.discount_id, {
              ...discount,
              verification_status: "possibly-outdated",
            });
          }
          return next;
        });
      }
    }
    setBusyId("");
  }

  if (loading) {
    return (
      <div className="admin-state-card" role="status">
        <span className="account-loading-spinner" />
        Loading the review queue…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-state-card">
        <span className="account-state-icon">
          <Icon name="user" size={27} />
        </span>
        <h1>Log in to continue</h1>
        <p>The CampusPerks review queue is restricted to administrators.</p>
        <Link className="button button-primary" href="/login?next=/admin">
          Log in
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-state-card">
        <span className="account-state-icon">
          <Icon name="shield" size={27} />
        </span>
        <h1>Administrator access required</h1>
        <p>This page is private and restricted to CampusPerks administrators.</p>
        {error && (
          <p className="form-error-message" role="alert">
            {error}
          </p>
        )}
        <Link className="button secondary-button" href="/account">
          Back to my account
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-review">
      <div className="admin-review-heading">
        <div>
          <span className="eyebrow">Private administrator area</span>
          <h1>Discount review queue</h1>
          <p>
            Review new submissions and community reports before public listings
            change.
          </p>
        </div>
        <Link className="button secondary-button" href="/account">
          My account
        </Link>
      </div>

      <div className="admin-queue-switcher" aria-label="Choose review queue">
        <button
          className={queueView === "submissions" ? "active" : ""}
          onClick={() => setQueueView("submissions")}
          type="button"
        >
          Discount submissions
          <span>{submissionCounts.pending}</span>
        </button>
        <button
          className={queueView === "reports" ? "active" : ""}
          onClick={() => setQueueView("reports")}
          type="button"
        >
          Outdated reports
          <span>{reportCounts.pending}</span>
        </button>
      </div>

      {error && (
        <div className="admin-error-message" role="alert">
          <Icon name="flag" size={17} /> {error}
        </div>
      )}

      {queueView === "submissions" ? (
        <>
          <div className="admin-summary-grid">
            <div>
              <span>Waiting for review</span>
              <strong>{submissionCounts.pending}</strong>
            </div>
            <div>
              <span>Approved</span>
              <strong>{submissionCounts.approved}</strong>
            </div>
            <div>
              <span>Rejected</span>
              <strong>{submissionCounts.rejected}</strong>
            </div>
          </div>
          <div className="admin-filter-tabs" aria-label="Filter submissions">
            {(
              ["pending", "approved", "rejected", "all"] as const
            ).map((status) => (
              <button
                aria-pressed={submissionFilter === status}
                className={submissionFilter === status ? "active" : ""}
                key={status}
                onClick={() => setSubmissionFilter(status)}
                type="button"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span>{submissionCounts[status]}</span>
              </button>
            ))}
          </div>

          {filteredSubmissions.length > 0 ? (
            <div className="admin-submission-list">
              {filteredSubmissions.map((submission) => {
                const college = colleges.get(submission.college_id);
                const isBusy = busyId === submission.id;
                return (
                  <article
                    className="admin-submission-card"
                    key={submission.id}
                  >
                    <div className="admin-submission-top">
                      <div>
                        <span
                          className={`admin-status-badge status-${submission.status}`}
                        >
                          {submission.status}
                        </span>
                        <span className="admin-submission-date">
                          Submitted {formatDate(submission.created_at)}
                        </span>
                      </div>
                      <span className="admin-college-pill">
                        {college?.short_name ?? "College"}
                      </span>
                    </div>
                    <div className="admin-submission-title">
                      <span
                        className="business-logo"
                        aria-hidden="true"
                        style={{ backgroundColor: "#6652df" }}
                      >
                        {submission.business_name
                          .split(/\s+/)
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div>
                        <h2>{submission.business_name}</h2>
                        <p>{submission.discount_title}</p>
                      </div>
                    </div>
                    <dl className="admin-submission-details">
                      <div>
                        <dt>College</dt>
                        <dd>{college?.name ?? "Unknown college"}</dd>
                      </div>
                      <div>
                        <dt>Category</dt>
                        <dd>{submission.category}</dd>
                      </div>
                      <div>
                        <dt>Address</dt>
                        <dd>{submission.address}</dd>
                      </div>
                      <div>
                        <dt>Source</dt>
                        <dd>{submission.source}</dd>
                      </div>
                      {submission.notes && (
                        <div className="admin-detail-full">
                          <dt>Student notes</dt>
                          <dd>{submission.notes}</dd>
                        </div>
                      )}
                    </dl>
                    {submission.status === "pending" ? (
                      <ReviewControls
                        busy={isBusy}
                        note={notes[submission.id] ?? ""}
                        onChange={(value) =>
                          setNotes((current) => ({
                            ...current,
                            [submission.id]: value,
                          }))
                        }
                        onPrimary={() =>
                          reviewSubmission(submission.id, "approved")
                        }
                        onSecondary={() =>
                          reviewSubmission(submission.id, "rejected")
                        }
                        primaryLabel="Approve and Publish"
                        secondaryLabel="Reject"
                      />
                    ) : (
                      <div className="admin-reviewed-footer">
                        <span>Reviewed {formatDate(submission.reviewed_at)}</span>
                        {submission.published_discount_id && (
                          <Link
                            href={`/discounts/${submission.published_discount_id}`}
                          >
                            Open listing <Icon name="arrow-right" size={14} />
                          </Link>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyQueue
              filter={submissionFilter}
              noun="submissions"
            />
          )}
        </>
      ) : (
        <>
          <div className="admin-summary-grid">
            <div>
              <span>Waiting for review</span>
              <strong>{reportCounts.pending}</strong>
            </div>
            <div>
              <span>Marked outdated</span>
              <strong>{reportCounts.resolved}</strong>
            </div>
            <div>
              <span>Dismissed</span>
              <strong>{reportCounts.dismissed}</strong>
            </div>
          </div>
          <div className="admin-filter-tabs" aria-label="Filter reports">
            {(
              ["pending", "resolved", "dismissed", "all"] as const
            ).map((status) => (
              <button
                aria-pressed={reportFilter === status}
                className={reportFilter === status ? "active" : ""}
                key={status}
                onClick={() => setReportFilter(status)}
                type="button"
              >
                {status === "resolved"
                  ? "Marked outdated"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
                <span>{reportCounts[status]}</span>
              </button>
            ))}
          </div>

          {filteredReports.length > 0 ? (
            <div className="admin-submission-list">
              {filteredReports.map((report) => {
                const discount = discounts.get(report.discount_id);
                const business = discount
                  ? businesses.get(discount.business_id)
                  : undefined;
                const isBusy = busyId === report.id;
                return (
                  <article className="admin-submission-card" key={report.id}>
                    <div className="admin-submission-top">
                      <div>
                        <span
                          className={`admin-status-badge status-${report.status}`}
                        >
                          {statusLabel(report.status)}
                        </span>
                        <span className="admin-submission-date">
                          Reported {formatDate(report.created_at)}
                        </span>
                      </div>
                      <Link
                        className="admin-open-deal"
                        href={`/discounts/${report.discount_id}`}
                      >
                        Open deal <Icon name="arrow-right" size={14} />
                      </Link>
                    </div>
                    <div className="admin-submission-title">
                      <span
                        className="business-logo"
                        aria-hidden="true"
                        style={{ backgroundColor: "#6652df" }}
                      >
                        {(business?.name ?? "Deal")
                          .split(/\s+/)
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div>
                        <h2>{business?.name ?? "Discount listing"}</h2>
                        <p>{discount?.title ?? "Listing details unavailable"}</p>
                      </div>
                    </div>
                    <dl className="admin-submission-details">
                      <div>
                        <dt>Report reason</dt>
                        <dd>{report.reason}</dd>
                      </div>
                      <div>
                        <dt>Current status</dt>
                        <dd>
                          {statusLabel(
                            discount?.verification_status ?? "unknown",
                          )}
                        </dd>
                      </div>
                      {report.details && (
                        <div className="admin-detail-full">
                          <dt>Student details</dt>
                          <dd>{report.details}</dd>
                        </div>
                      )}
                    </dl>
                    {report.status === "pending" ? (
                      <ReviewControls
                        busy={isBusy}
                        note={notes[report.id] ?? ""}
                        onChange={(value) =>
                          setNotes((current) => ({
                            ...current,
                            [report.id]: value,
                          }))
                        }
                        onPrimary={() =>
                          reviewReport(report.id, "possibly-outdated")
                        }
                        onSecondary={() =>
                          reviewReport(report.id, "dismissed")
                        }
                        primaryLabel="Mark Possibly Outdated"
                        secondaryLabel="Dismiss Report"
                      />
                    ) : (
                      <div className="admin-reviewed-footer">
                        <span>Reviewed {formatDate(report.reviewed_at)}</span>
                        <span>
                          {report.status === "resolved"
                            ? "Listing kept online with an outdated warning"
                            : "Listing left unchanged"}
                        </span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyQueue filter={reportFilter} noun="reports" />
          )}
        </>
      )}
    </div>
  );
}

function ReviewControls({
  busy,
  note,
  onChange,
  onPrimary,
  onSecondary,
  primaryLabel,
  secondaryLabel,
}: {
  busy: boolean;
  note: string;
  onChange: (value: string) => void;
  onPrimary: () => void;
  onSecondary: () => void;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <>
      <label className="admin-notes-field">
        <span>Private review notes (optional)</span>
        <textarea
          onChange={(event) => onChange(event.target.value)}
          placeholder="Add the evidence or reason behind this decision."
          rows={3}
          value={note}
        />
      </label>
      <div className="admin-review-actions">
        <button
          className="button admin-reject-button"
          disabled={busy}
          onClick={onSecondary}
          type="button"
        >
          {secondaryLabel}
        </button>
        <button
          className="button button-primary"
          disabled={busy}
          onClick={onPrimary}
          type="button"
        >
          {busy ? "Saving…" : primaryLabel}
          {!busy && <Icon name="check" size={16} />}
        </button>
      </div>
    </>
  );
}

function EmptyQueue({
  filter,
  noun,
}: {
  filter: string;
  noun: string;
}) {
  return (
    <div className="admin-empty-state">
      <span>
        <Icon name="check" size={27} />
      </span>
      <h2>No {filter === "all" ? "" : statusLabel(filter)} {noun}</h2>
      <p>
        {filter === "pending"
          ? "The review queue is clear."
          : `Items with this status will appear here.`}
      </p>
    </div>
  );
}
