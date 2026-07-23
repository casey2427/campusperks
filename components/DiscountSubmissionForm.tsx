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

export function DiscountSubmissionForm() {
  const [user, setUser] = useState<User | null>();
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [collegeId, setCollegeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadForm() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        if (!isActive) return;
        setError("CampusPerks could not connect to the database.");
        setUser(null);
        setLoading(false);
        return;
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!isActive) return;
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
          .select("college_id")
          .eq("id", currentUser.id)
          .maybeSingle(),
      ]);

      if (!isActive) return;
      setColleges((collegeRows as CollegeOption[] | null) ?? []);
      setCollegeId(profile?.college_id ?? "");
      setLoading(false);
    }

    loadForm();

    return () => {
      isActive = false;
    };
  }, []);

  async function submitDiscount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);
    setError("");

    const { error: submissionError } = await supabase
      .from("discount_submissions")
      .insert({
        submitted_by: user.id,
        college_id: collegeId,
        business_name: String(formData.get("business") ?? "").trim(),
        discount_title: String(formData.get("discount") ?? "").trim(),
        category: String(formData.get("category") ?? ""),
        address: String(formData.get("address") ?? "").trim(),
        source: String(formData.get("source") ?? "").trim(),
        notes: String(formData.get("notes") ?? "").trim() || null,
      });

    if (submissionError) {
      setError(
        submissionError.message.includes("discount_submissions")
          ? "The submission database needs its one-time setup before this form can save."
          : submissionError.message,
      );
      setSubmitting(false);
      return;
    }

    form.reset();
    setCollegeId("");
    setSubmitted(true);
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="submission-success submission-loading" role="status">
        <span className="account-loading-spinner" />
        Loading the submission form…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="submission-success submission-auth-required">
        <span className="submission-success-icon">
          <Icon name="user" size={30} />
        </span>
        <p className="section-kicker">Student contribution</p>
        <h1>Log in before submitting a discount</h1>
        <p>
          Signing in lets CampusPerks show you the review status and helps
          protect the community from anonymous spam.
        </p>
        {error && (
          <p className="form-error-message" role="alert">
            {error}
          </p>
        )}
        <div className="submission-success-actions">
          <Link
            className="button button-primary section-button"
            href="/login?next=/submit-discount"
          >
            Log in to continue <Icon name="arrow-right" size={17} />
          </Link>
          <Link
            className="button secondary-button section-button"
            href="/signup"
          >
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="submission-success" role="status">
        <span className="submission-success-icon">
          <Icon name="check" size={30} />
        </span>
        <p className="section-kicker">Submitted for review</p>
        <h1>Thanks for helping students save.</h1>
        <p>
          Your discount is now in the CampusPerks review queue. It will not
          appear publicly until an administrator approves it.
        </p>
        <div className="submission-success-actions">
          <button
            className="button button-primary section-button"
            onClick={() => setSubmitted(false)}
            type="button"
          >
            Submit another discount
          </button>
          <Link className="button secondary-button section-button" href="/account">
            View my account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="discount-submission-form" onSubmit={submitDiscount}>
      <div className="form-heading">
        <span className="form-icon">
          <Icon name="tag" size={25} />
        </span>
        <div>
          <p className="section-kicker">Student contribution</p>
          <h1>Submit a student discount</h1>
          <p>
            Found a deal near campus? Share what you know so other students can
            save too.
          </p>
        </div>
      </div>

      <div className="form-review-note">
        <Icon name="shield" size={17} />
        Every submission is reviewed before it appears publicly.
      </div>

      <div className="form-grid">
        <label>
          <span>Business name</span>
          <input
            maxLength={120}
            name="business"
            placeholder="Example: Campus Café"
            required
            type="text"
          />
        </label>

        <label>
          <span>Your college</span>
          <select
            name="college"
            onChange={(event) => setCollegeId(event.target.value)}
            required
            value={collegeId}
          >
            <option disabled value="">
              Choose your college
            </option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-full">
          <span>What is the discount?</span>
          <input
            maxLength={180}
            name="discount"
            placeholder="Example: 15% off with a valid student ID"
            required
            type="text"
          />
        </label>

        <label>
          <span>Category</span>
          <select defaultValue="" name="category" required>
            <option disabled value="">
              Choose a category
            </option>
            <option>Food and drinks</option>
            <option>Shopping</option>
            <option>Fitness</option>
            <option>Entertainment</option>
            <option>Technology</option>
            <option>Travel</option>
            <option>Beauty</option>
            <option>Subscriptions</option>
          </select>
        </label>

        <label>
          <span>Business address</span>
          <input
            maxLength={220}
            name="address"
            placeholder="Street address or neighborhood"
            required
            type="text"
          />
        </label>

        <label className="form-full">
          <span>Where did you find this discount?</span>
          <input
            maxLength={500}
            name="source"
            placeholder="Business website, sign in store, employee, etc."
            required
            type="text"
          />
        </label>

        <label className="form-full">
          <span>
            Anything else students should know? <em>Optional</em>
          </span>
          <textarea
            maxLength={1000}
            name="notes"
            placeholder="Add restrictions, expiration details, or redemption instructions."
            rows={4}
          />
        </label>
      </div>

      {error && (
        <p className="form-error-message" role="alert">
          <Icon name="flag" size={16} /> {error}
        </p>
      )}

      <p className="form-disclaimer">
        Please only submit information you believe is accurate. Your account is
        attached to the submission for review purposes.
      </p>

      <button
        className="button button-primary form-submit"
        disabled={submitting || !collegeId}
        type="submit"
      >
        {submitting ? "Submitting…" : "Submit for Review"}
        {!submitting && <Icon name="arrow-right" size={18} />}
      </button>
    </form>
  );
}
