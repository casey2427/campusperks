import type { Metadata } from "next";
import Link from "next/link";
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
        <Link href="/">Back to homepage</Link>
      </div>
      <DiscountSubmissionForm />
    </main>
  );
}
