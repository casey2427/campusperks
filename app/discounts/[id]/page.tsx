import type { Metadata } from "next";
import { DealDetail } from "@/components/DealDetail";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

type DealPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ college?: string }>;
};

export const metadata: Metadata = {
  title: "Student Discount Details | CampusPerks",
  description:
    "Review student discount details, verification evidence, community feedback, and redemption instructions on CampusPerks.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function DealPage({
  params,
  searchParams,
}: DealPageProps) {
  const [{ id }, { college }] = await Promise.all([params, searchParams]);

  return (
    <>
      <Header />
      <main>
        <DealDetail discountId={id} initialCollegeSlug={college} />
      </main>
      <Footer />
    </>
  );
}
