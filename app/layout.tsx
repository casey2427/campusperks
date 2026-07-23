import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.campusperks.example"),
  title: "Student Discounts Near Me | CampusPerks",
  description:
    "Enter your college to discover nearby student discounts on food, shopping, fitness, entertainment, technology, and more.",
  alternates: {
    canonical: "https://www.campusperks.example",
  },
  openGraph: {
    type: "website",
    title: "Student Discounts Near Me | CampusPerks",
    description:
      "Enter your college to discover nearby student discounts on food, shopping, fitness, entertainment, technology, and more.",
    url: "https://www.campusperks.example",
    siteName: "CampusPerks",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Discounts Near Me | CampusPerks",
    description:
      "Discover nearby student discounts by entering your college.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
