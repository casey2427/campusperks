"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Icon } from "./Icon";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError(
        "Supabase is not connected in this deployment yet. Redeploy the Vercel project after installing the integration.",
      );
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    setBusy(true);

    if (isSignup) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session) {
        router.push("/account");
        router.refresh();
      } else {
        setSuccess(
          "Account created. Check your email and click the confirmation link to finish signing up.",
        );
      }
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
      } else {
        const requestedNext = new URLSearchParams(window.location.search).get(
          "next",
        );
        const safeNext =
          requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
            ? requestedNext
            : "/account";

        router.push(safeNext);
        router.refresh();
      }
    }

    setBusy(false);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isSignup && (
        <label>
          <span>Your name</span>
          <input
            autoComplete="name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Jordan Lee"
            required
            type="text"
            value={name}
          />
        </label>
      )}

      <label>
        <span>College email</span>
        <input
          autoComplete="email"
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@university.edu"
          required
          type="email"
          value={email}
        />
      </label>

      <label>
        <span>Password</span>
        <input
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          required
          type="password"
          value={password}
        />
      </label>

      {error && (
        <p className="auth-message auth-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="auth-message auth-success" role="status">
          <Icon name="check" size={17} />
          {success}
        </p>
      )}

      <button
        className="button button-primary auth-submit"
        disabled={busy || Boolean(success)}
        type="submit"
      >
        {busy
          ? isSignup
            ? "Creating account..."
            : "Logging in..."
          : isSignup
            ? "Create free account"
            : "Log in"}
        {!busy && <Icon name="arrow-right" size={17} />}
      </button>

      <p className="auth-switch">
        {isSignup ? "Already have an account?" : "New to CampusPerks?"}{" "}
        <Link href={isSignup ? "/login" : "/signup"}>
          {isSignup ? "Log in" : "Sign up free"}
        </Link>
      </p>
    </form>
  );
}
