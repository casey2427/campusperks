export interface College {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  location: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  initials: string;
  color: string;
}

export type VerificationStatus =
  | "business-verified"
  | "student-confirmed"
  | "official-source"
  | "pending-review"
  | "possibly-outdated";

export interface Discount {
  id: string;
  business: Business;
  title: string;
  category: string;
  address: string;
  distance: string;
  verificationStatus: VerificationStatus;
  lastChecked: string;
  accent: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
  isDemo?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  wordmark: string;
  color: string;
}
