import type { Metadata } from "next";
import { AdminReviewPanel } from "@/components/AdminReviewPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Discount Review | CampusPerks",
  description: "Private CampusPerks discount submission review queue.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="admin-page">
        <div className="container">
          <AdminReviewPanel />
        </div>
      </main>
      <Footer />
    </>
  );
}
