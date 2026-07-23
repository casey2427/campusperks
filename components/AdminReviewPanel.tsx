"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Icon } from "./Icon";

type ReviewStatus = "pending" | "approved" | "rejected";
type StatusFilter = "all" | ReviewStatus;

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

export function AdminReviewPanel() {
  const [user, setUser] = useState<User | null>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [colleges, setColleges] = useState<Map<string, CollegeRow>>(new Map());
  const [filter, setFilter] = useState<StatusFilter>("pending");
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
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const [
        { data: submissionRows, error: queueError },
        { data: collegeRows },
      ] = await Promise.all([
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
      ]);

      if (queueError) {
        setError(queueError.message);
      } else {
        setSubmissions((submissionRows as Submission[] | null) ?? []);
        setColleges(
          new Map(
            ((collegeRows as CollegeRow[] | null) ?? []).map((college) => [
              college.id,
              college,
            ]),
          ),
        );
      }

      setLoading(false);
    }

    loadQueue();
  }, []);

  const filteredSubmissions = useMemo(
    () =>
      filter === "all"
        ? submissions
        : submissions.filter((submission) => submission.status === filter),
    [filter, submissions],
  );

  const counts = useMemo(
    () => ({
      all: submissions.length,
      pending: submissions.filter((item) => item.status === "pending").length,
      approved: submissions.filter((item) => item.status === "approved").length,
      rejected: submissions.filter((item) => item.status === "rejected").length,
    }),
    [submissions],
  );

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
      setBusyId("");
      return;
    }

    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId
          ? {
              ...submission,
              status: decision,
              admin_notes: notes[submissionId]?.trim() || null,
              published_discount_id:
                decision === "approved"
                  ? String(publishedId ?? "")
                  : submission.published_discount_id,
              reviewed_at: new Date().toISOString(),
            }
          : submission,
      ),
    );
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
        <p>
          This page is private. If this is your account, finish the one-time
          admin setup in Supabase.
        </p>
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
            Approve accurate submissions before they appear in public college
            results. Rejected submissions remain recorded for accountability.
          </p>
        </div>
        <Link className="button secondary-button" href="/account">
          My account
        </Link>
      </div>

      <div className="admin-summary-grid">
        <div>
          <span>Waiting for review</span>
          <strong>{counts.pending}</strong>
        </div>
        <div>
          <span>Approved</span>
          <strong>{counts.approved}</strong>
        </div>
        <div>
          <span>Rejected</span>
          <strong>{counts.rejected}</strong>
        </div>
      </div>

      <div className="admin-filter-tabs" aria-label="Filter submissions">
        {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map(
          (status) => (
            <button
              aria-pressed={filter === status}
              className={filter === status ? "active" : ""}
              key={status}
              onClick={() => setFilter(status)}
              type="button"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span>{counts[status]}</span>
            </button>
          ),
        )}
      </div>

      {error && (
        <div className="admin-error-message" role="alert">
          <Icon name="flag" size={17} /> {error}
        </div>
      )}

      {filteredSubmissions.length > 0 ? (
        <div className="admin-submission-list">
          {filteredSubmissions.map((submission) => {
            const college = colleges.get(submission.college_id);
            const isBusy = busyId === submission.id;

            return (
              <article className="admin-submission-card" key={submission.id}>
                <div className="admin-submission-top">
                  <div>
                    <span
                      className={`admin-status-badge status-${submission.status}`}
                    >
                      {submission.status}
                    </span>
                    <span className="admin-submission-date">
                      Submitted{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(submission.created_at))}
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
                  <>
                    <label className="admin-notes-field">
                      <span>Private review notes (optional)</span>
                      <textarea
                        onChange={(event) =>
                          setNotes((current) => ({
                            ...current,
                            [submission.id]: event.target.value,
                          }))
                        }
                        placeholder="Add why this was approved or rejected."
                        rows={3}
                        value={notes[submission.id] ?? ""}
                      />
                    </label>
                    <div className="admin-review-actions">
                      <button
                        className="button admin-reject-button"
                        disabled={isBusy}
                        onClick={() =>
                          reviewSubmission(submission.id, "rejected")
                        }
                        type="button"
                      >
                        Reject
                      </button>
                      <button
                        className="button button-primary"
                        disabled={isBusy}
                        onClick={() =>
                          reviewSubmission(submission.id, "approved")
                        }
                        type="button"
                      >
                        {isBusy ? "Saving…" : "Approve and Publish"}
                        {!isBusy && <Icon name="check" size={16} />}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="admin-reviewed-footer">
                    <span>
                      Reviewed{" "}
                      {submission.reviewed_at
                        ? new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(submission.reviewed_at))
                        : "recently"}
                    </span>
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
        <div className="admin-empty-state">
          <span>
            <Icon name="check" size={27} />
          </span>
          <h2>No {filter === "all" ? "" : filter} submissions</h2>
          <p>
            {filter === "pending"
              ? "The review queue is clear."
              : "Submissions with this status will appear here."}
          </p>
        </div>
      )}
    </div>
  );
}
