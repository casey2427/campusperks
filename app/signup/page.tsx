import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Sign Up | CampusPerks",
  description: "Create a free CampusPerks student account.",
};

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="auth-page">
        <div className="auth-page-glow auth-page-glow-left" />
        <div className="auth-page-glow auth-page-glow-right" />
        <div className="auth-layout">
          <section className="auth-intro">
            <span className="auth-icon">
              <Icon name="tag" size={24} />
            </span>
            <span className="eyebrow">Free for students</span>
            <h1>Start building your personal discount list.</h1>
            <p>
              Create an account to save deals, help confirm what works, and
              contribute discounts near your campus.
            </p>
            <ul className="auth-benefit-list">
              <li><Icon name="check" size={17} /> Save discounts for later</li>
              <li><Icon name="check" size={17} /> Vote helpful or not helpful</li>
              <li><Icon name="check" size={17} /> Choose your college</li>
            </ul>
          </section>
          <section className="auth-card" aria-labelledby="signup-heading">
            <span className="auth-card-label">Student account</span>
            <h2 id="signup-heading">Create your account</h2>
            <p>CampusPerks is free for students.</p>
            <AuthForm mode="signup" />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
