"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { Icon } from "./Icon";

export function AuthNav({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setUser(null);
    onNavigate?.();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <span
        aria-label="Checking account"
        className={`auth-nav-loading auth-nav-${variant}`}
      />
    );
  }

  if (user) {
    const name =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Student";

    return (
      <div className={`auth-nav auth-nav-${variant}`}>
        <Link className="account-link" href="/account" onClick={onNavigate}>
          <span className="account-avatar" aria-hidden="true">
            {String(name).charAt(0).toUpperCase()}
          </span>
          <span>{name}</span>
        </Link>
        <button className="auth-signout" onClick={signOut} type="button">
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className={`auth-nav auth-nav-${variant}`}>
      <Link className="login-link" href="/login" onClick={onNavigate}>
        Log In
      </Link>
      <Link
        className="button button-primary signup-button"
        href="/signup"
        onClick={onNavigate}
      >
        Sign Up <Icon name="arrow-right" size={15} />
      </Link>
    </div>
  );
}
