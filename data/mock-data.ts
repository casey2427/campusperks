import type {
  Brand,
  Business,
  Category,
  College,
  Discount,
  VerificationStatus,
} from "@/types";

export const colleges: College[] = [
  { id: "ucla", name: "University of California, Los Angeles", shortName: "UCLA", slug: "ucla", location: "Los Angeles, CA" },
  { id: "usc", name: "University of Southern California", shortName: "USC", slug: "university-of-southern-california", location: "Los Angeles, CA" },
  { id: "bu", name: "Boston University", shortName: "BU", slug: "boston-university", location: "Boston, MA" },
  { id: "nyu", name: "New York University", shortName: "NYU", slug: "new-york-university", location: "New York, NY" },
  { id: "uta", name: "University of Texas at Austin", shortName: "UT Austin", slug: "university-of-texas-at-austin", location: "Austin, TX" },
  { id: "asu", name: "Arizona State University", shortName: "ASU", slug: "arizona-state-university", location: "Tempe, AZ" },
  { id: "uci", name: "University of California, Irvine", shortName: "UC Irvine", slug: "university-of-california-irvine", location: "Irvine, CA" },
  { id: "umich", name: "University of Michigan", shortName: "Michigan", slug: "university-of-michigan", location: "Ann Arbor, MI" },
  { id: "osu", name: "Ohio State University", shortName: "Ohio State", slug: "ohio-state-university", location: "Columbus, OH" },
  { id: "uf", name: "University of Florida", shortName: "UF", slug: "university-of-florida", location: "Gainesville, FL" },
];

export const brands: Brand[] = [
  { id: "nike", name: "Nike", slug: "nike", wordmark: "NIKE", color: "#111827" },
  { id: "ulta", name: "Ulta Beauty", slug: "ulta-beauty", wordmark: "ULTA BEAUTY", color: "#f97316" },
  { id: "spotify", name: "Spotify", slug: "spotify", wordmark: "Spotify", color: "#16a34a" },
  { id: "chipotle", name: "Chipotle", slug: "chipotle", wordmark: "CHIPOTLE", color: "#9f2d20" },
  { id: "adidas", name: "Adidas", slug: "adidas", wordmark: "adidas", color: "#111827" },
  { id: "sweetgreen", name: "Sweetgreen", slug: "sweetgreen", wordmark: "sweetgreen", color: "#18392b" },
];

export const benefits = [
  {
    title: "Exclusive student deals",
    description:
      "Access discounts collected from businesses, official sources, and student submissions.",
    icon: "tag",
  },
  {
    title: "Near you",
    description:
      "Discover deals close to your campus so you can save where you already shop and eat.",
    icon: "pin",
  },
  {
    title: "100% free",
    description:
      "CampusPerks is free for students to search, browse, and submit deals.",
    icon: "check",
  },
] as const;

export const categories: Category[] = [
  { id: "food", name: "Food and drinks", slug: "food-and-drinks", icon: "utensils", color: "#fff3e8" },
  { id: "shopping", name: "Shopping", slug: "shopping", icon: "bag", color: "#f1ecff" },
  { id: "fitness", name: "Fitness", slug: "fitness", icon: "fitness", color: "#e8f8f1" },
  { id: "entertainment", name: "Entertainment", slug: "entertainment", icon: "ticket", color: "#ffedf5" },
  { id: "technology", name: "Technology", slug: "technology", icon: "laptop", color: "#e9f3ff" },
  { id: "travel", name: "Travel", slug: "travel", icon: "plane", color: "#e9f8ff" },
  { id: "beauty", name: "Beauty", slug: "beauty", icon: "sparkles", color: "#fff0fa" },
  { id: "subscriptions", name: "Subscriptions", slug: "subscriptions", icon: "play", color: "#f1efff" },
];

const businesses: Business[] = [
  { id: "campus-cafe", name: "Campus Café", slug: "campus-cafe", initials: "CC", color: "#7c3aed" },
  { id: "fit-house", name: "Fit House", slug: "fit-house", initials: "FH", color: "#0f766e" },
  { id: "city-cinema", name: "City Cinema", slug: "city-cinema", initials: "CC", color: "#db2777" },
  { id: "green-bowl", name: "Green Bowl", slug: "green-bowl", initials: "GB", color: "#16a34a" },
];

export const discounts: Discount[] = [
  {
    id: "campus-cafe-15",
    business: businesses[0],
    title: "15% off with student ID",
    category: "Food and drinks",
    address: "118 Campus Avenue",
    distance: "0.3 mi",
    verificationStatus: "business-verified",
    lastChecked: "Jul 18, 2026",
    accent: "linear-gradient(135deg, #ede9fe, #dbeafe)",
  },
  {
    id: "fit-house-student",
    business: businesses[1],
    title: "Discounted student membership",
    category: "Fitness",
    address: "42 Westwood Plaza",
    distance: "0.7 mi",
    verificationStatus: "student-confirmed",
    lastChecked: "Jul 15, 2026",
    accent: "linear-gradient(135deg, #d1fae5, #e0f2fe)",
  },
  {
    id: "city-cinema-admission",
    business: businesses[2],
    title: "Student admission pricing",
    category: "Entertainment",
    address: "280 Center Street",
    distance: "1.1 mi",
    verificationStatus: "official-source",
    lastChecked: "Jul 11, 2026",
    accent: "linear-gradient(135deg, #fce7f3, #f3e8ff)",
  },
  {
    id: "green-bowl-drink",
    business: businesses[3],
    title: "Free drink with qualifying purchase",
    category: "Food and drinks",
    address: "70 University Walk",
    distance: "1.4 mi",
    verificationStatus: "pending-review",
    lastChecked: "Jul 8, 2026",
    accent: "linear-gradient(135deg, #dcfce7, #fef3c7)",
  },
];

export const verificationLabels: Record<VerificationStatus, string> = {
  "business-verified": "Business verified",
  "student-confirmed": "Student confirmed",
  "official-source": "Official source found",
  "pending-review": "Pending review",
  "possibly-outdated": "Possibly outdated",
};
