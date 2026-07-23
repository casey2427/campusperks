import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Log In | CampusPerks",
  description: "Log in to save and help verify student discounts.",
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="auth-page">
        <div className="auth-page-glow auth-page-glow-left" />
        <div className="auth-page-glow auth-page-glow-right" />
        <div className="auth-layout">
          <section className="auth-intro">
            <span className="auth-icon">
              <Icon name="user" size={24} />
            </span>
            <span className="eyebrow">Welcome back</span>
            <h1>Keep your favorite student deals close.</h1>
            <p>
              Log in to save discounts, vote on helpful offers, and keep your
              college preferences in one place.
            </p>
          </section>
          <section className="auth-card" aria-labelledby="login-heading">
            <span className="auth-card-label">CampusPerks account</span>
            <h2 id="login-heading">Log in</h2>
            <p>Enter the email and password you used to sign up.</p>
            <AuthForm mode="login" />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
