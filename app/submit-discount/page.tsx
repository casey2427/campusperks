import type { Metadata } from "next";
import { DiscountSubmissionForm } from "@/components/DiscountSubmissionForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Submit a Student Discount | CampusPerks",
  description:
    "Share a student discount you found near your college campus.",
};

export default function SubmitDiscountPage() {
  return (
    <main className="submission-page">
      <div className="submission-page-header">
        <Logo />
        <a href="/">Back to homepage</a>
      </div>
      <DiscountSubmissionForm />
    </main>
  );
}
