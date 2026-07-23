import type { Metadata } from "next";
import { AccountPanel } from "@/components/AccountPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "My Account | CampusPerks",
  description: "Manage your CampusPerks student account and college.",
};

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="account-page">
        <div className="container">
          <AccountPanel />
        </div>
      </main>
      <Footer />
    </>
  );
}
