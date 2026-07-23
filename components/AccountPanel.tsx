"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Icon } from "./Icon";

type CollegeOption = {
  id: string;
  name: string;
  short_name: string;
};

type SavedDeal = {
  id: string;
  title: string;
  businessName: string;
};

type SubmissionSummary = {
  id: string;
  business_name: string;
  discount_title: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  published_discount_id: string | null;
};

export function AccountPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [collegeId, setCollegeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccount() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setError(
          "Supabase is not available in this deployment. Redeploy through Vercel after connecting the integration.",
        );
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

      const [{ data: collegeRows }, { data: profile }] = await Promise.all([
        supabase
          .from("colleges")
          .select("id, name, short_name")
          .order("name"),
        supabase
          .from("profiles")
          .select("college_id, is_admin")
          .eq("id", currentUser.id)
          .maybeSingle(),
      ]);

      setColleges((collegeRows as CollegeOption[] | null) ?? []);
      setCollegeId(profile?.college_id ?? "");
      setIsAdmin(Boolean(profile?.is_admin));

      const { data: savedRows } = await supabase
        .from("saves")
        .select("discount_id")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      const savedIds = (savedRows ?? []).map((row) => row.discount_id);

      if (savedIds.length > 0) {
        const { data: discountRows } = await supabase
          .from("discounts")
          .select("id, title, business_id")
          .in("id", savedIds);
        const businessIds = [
          ...new Set((discountRows ?? []).map((row) => row.business_id)),
        ];
        const { data: businessRows } = await supabase
          .from("businesses")
          .select("id, name")
          .in("id", businessIds);
        const businessNames = new Map(
          (businessRows ?? []).map((business) => [
            business.id,
            business.name,
          ]),
        );
        const discountsById = new Map(
          (discountRows ?? []).map((discount) => [discount.id, discount]),
        );

        setSavedDeals(
          savedIds
            .map((id) => discountsById.get(id))
            .filter((discount) => Boolean(discount))
            .map((discount) => ({
              id: discount!.id,
              title: discount!.title,
              businessName:
                businessNames.get(discount!.business_id) ?? "CampusPerks deal",
            })),
        );
      }

      const { data: submissionRows } = await supabase
        .from("discount_submissions")
        .select(
          "id, business_name, discount_title, status, created_at, published_discount_id",
        )
        .eq("submitted_by", currentUser.id)
        .order("created_at", { ascending: false });

      setSubmissions(
        (submissionRows as SubmissionSummary[] | null) ?? [],
      );

      setLoading(false);
    }

    loadAccount();
  }, []);

  async function saveCollege() {
    if (!user || !collegeId) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setSaving(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ college_id: collegeId })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Your college has been saved.");
    }

    setSaving(false);
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="account-loading" role="status">
        <span />
        Loading your account...
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="account-empty-state">
        <span className="account-state-icon">
          <Icon name="user" size={27} />
        </span>
        <h1>Account connection unavailable</h1>
        <p>{error}</p>
        <Link className="button button-primary" href="/">
          Back to homepage
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="account-empty-state">
        <span className="account-state-icon">
          <Icon name="user" size={27} />
        </span>
        <h1>Log in to view your account</h1>
        <p>
          Your saved discounts, votes, submissions, and college preferences
          will live here.
        </p>
        <Link className="button button-primary" href="/login">
          Log in
        </Link>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";

  return (
    <div className="account-dashboard">
      <div className="account-heading">
        <span className="account-large-avatar" aria-hidden="true">
          {String(displayName).charAt(0).toUpperCase()}
        </span>
        <div>
          <span className="eyebrow">Student account</span>
          <h1>Welcome, {displayName}</h1>
          <p>{user.email}</p>
          {isAdmin && (
            <Link className="account-admin-link" href="/admin">
              <Icon name="shield" size={15} />
              Open administrator review queue
            </Link>
          )}
        </div>
      </div>

      <div className="account-grid">
        <section className="account-card">
          <span className="account-card-icon">
            <Icon name="pin" size={22} />
          </span>
          <h2>Your college</h2>
          <p>
            Choose your school so CampusPerks can personalize nearby results.
          </p>
          <label htmlFor="account-college">College or university</label>
          <select
            id="account-college"
            onChange={(event) => {
              setCollegeId(event.target.value);
              setMessage("");
            }}
            value={collegeId}
          >
            <option value="">Choose your college</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
          <button
            className="button button-primary account-save-button"
            disabled={!collegeId || saving}
            onClick={saveCollege}
            type="button"
          >
            {saving ? "Saving..." : "Save college"}
          </button>
          {message && (
            <p className="account-success" role="status">
              <Icon name="check" size={15} /> {message}
            </p>
          )}
          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}
        </section>

        <section className="account-card account-saved-card">
          <div className="account-saved-heading">
            <span className="account-card-icon">
              <Icon name="heart" size={22} />
            </span>
            <span className="account-saved-count">{savedDeals.length}</span>
          </div>
          <h2>Saved discounts</h2>
          {savedDeals.length > 0 ? (
            <>
              <p>Your saved offers are ready whenever you need them.</p>
              <div className="account-saved-list">
                {savedDeals.map((deal) => (
                  <Link href={`/discounts/${deal.id}`} key={deal.id}>
                    <span>
                      <strong>{deal.businessName}</strong>
                      <small>{deal.title}</small>
                    </span>
                    <Icon name="arrow-right" size={16} />
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <p>
                Tap the heart on any college discount to keep it here for
                later.
              </p>
              <Link className="account-browse-link" href="/">
                Find your college <Icon name="arrow-right" size={15} />
              </Link>
            </>
          )}
        </section>
      </div>

      <section className="account-submissions-card">
        <div className="account-submissions-heading">
          <div>
            <span className="account-card-icon">
              <Icon name="tag" size={22} />
            </span>
            <div>
              <h2>My submitted discounts</h2>
              <p>Follow each discount from submission through review.</p>
            </div>
          </div>
          <Link className="button secondary-button" href="/submit-discount">
            Submit another
          </Link>
        </div>

        {submissions.length > 0 ? (
          <div className="account-submission-list">
            {submissions.map((submission) => (
              <article key={submission.id}>
                <div>
                  <span
                    className={`account-submission-status status-${submission.status}`}
                  >
                    {submission.status}
                  </span>
                  <strong>{submission.business_name}</strong>
                  <small>{submission.discount_title}</small>
                </div>
                {submission.published_discount_id ? (
                  <Link href={`/discounts/${submission.published_discount_id}`}>
                    View listing <Icon name="arrow-right" size={14} />
                  </Link>
                ) : (
                  <time dateTime={submission.created_at}>
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(submission.created_at))}
                  </time>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="account-submissions-empty">
            <p>You haven’t submitted any discounts yet.</p>
            <Link href="/submit-discount">Share the first one</Link>
          </div>
        )}
      </section>

      <button className="account-page-signout" onClick={signOut} type="button">
        Log out of CampusPerks
      </button>
    </div>
  );
}
