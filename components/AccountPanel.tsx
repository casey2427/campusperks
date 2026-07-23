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

export function AccountPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
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
          .select("college_id")
          .eq("id", currentUser.id)
          .maybeSingle(),
      ]);

      setColleges((collegeRows as CollegeOption[] | null) ?? []);
      setCollegeId(profile?.college_id ?? "");
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

        <section className="account-card account-coming-card">
          <span className="account-card-icon">
            <Icon name="heart" size={22} />
          </span>
          <h2>Saved discounts</h2>
          <p>
            Saved deals will appear here after voting and saving are connected
            in the next step.
          </p>
          <span className="account-coming-pill">Next feature</span>
        </section>
      </div>

      <button className="account-page-signout" onClick={signOut} type="button">
        Log out of CampusPerks
      </button>
    </div>
  );
}
