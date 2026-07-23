import type {
  Brand,
  Business,
  Category,
  College,
  Discount,
  VerificationStatus,
} from "@/types";

export const colleges: College[] = [
  { id: "ucla", name: "University of California, Los Angeles", shortName: "UCLA", slug: "ucla", location: "Los Angeles, CA", latitude: 34.0689, longitude: -118.4452 },
  { id: "usc", name: "University of Southern California", shortName: "USC", slug: "university-of-southern-california", location: "Los Angeles, CA", latitude: 34.0224, longitude: -118.2851 },
  { id: "bu", name: "Boston University", shortName: "BU", slug: "boston-university", location: "Boston, MA", latitude: 42.3505, longitude: -71.1054 },
  { id: "nyu", name: "New York University", shortName: "NYU", slug: "new-york-university", location: "New York, NY", latitude: 40.7295, longitude: -73.9965 },
  { id: "uta", name: "University of Texas at Austin", shortName: "UT Austin", slug: "university-of-texas-at-austin", location: "Austin, TX", latitude: 30.2849, longitude: -97.7341 },
  { id: "asu", name: "Arizona State University", shortName: "ASU", slug: "arizona-state-university", location: "Tempe, AZ", latitude: 33.4215, longitude: -111.9332 },
  { id: "uci", name: "University of California, Irvine", shortName: "UC Irvine", slug: "university-of-california-irvine", location: "Irvine, CA", latitude: 33.6405, longitude: -117.8443 },
  { id: "umich", name: "University of Michigan", shortName: "Michigan", slug: "university-of-michigan", location: "Ann Arbor, MI", latitude: 42.278, longitude: -83.7382 },
  { id: "osu", name: "Ohio State University", shortName: "Ohio State", slug: "ohio-state-university", location: "Columbus, OH", latitude: 40.0067, longitude: -83.0305 },
  { id: "uf", name: "University of Florida", shortName: "UF", slug: "university-of-florida", location: "Gainesville, FL", latitude: 29.6436, longitude: -82.3549 },
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
  { id: "tech-stop", name: "Tech Stop", slug: "tech-stop", initials: "TS", color: "#2563eb" },
  { id: "student-stage", name: "Student Stage", slug: "student-stage", initials: "SS", color: "#c026d3" },
  { id: "metro-cycle", name: "Metro Cycle", slug: "metro-cycle", initials: "MC", color: "#ea580c" },
  { id: "book-nook", name: "Book Nook", slug: "book-nook", initials: "BN", color: "#4f46e5" },
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

export const collegeDiscounts: Discount[] = [
  ...discounts,
  {
    id: "tech-stop-accessories",
    business: businesses[4],
    title: "10% off select accessories",
    category: "Technology",
    address: "215 College Boulevard",
    distance: "0.5 mi",
    verificationStatus: "possibly-outdated",
    lastChecked: "Jun 22, 2026",
    accent: "linear-gradient(135deg, #dbeafe, #eef2ff)",
  },
  {
    id: "student-stage-tickets",
    business: businesses[5],
    title: "Reduced-price student tickets",
    category: "Entertainment",
    address: "92 Arts District Way",
    distance: "0.9 mi",
    verificationStatus: "student-confirmed",
    lastChecked: "Jul 17, 2026",
    accent: "linear-gradient(135deg, #fae8ff, #fce7f3)",
  },
  {
    id: "metro-cycle-pass",
    business: businesses[6],
    title: "Student monthly ride pass",
    category: "Travel",
    address: "18 Transit Plaza",
    distance: "1.2 mi",
    verificationStatus: "official-source",
    lastChecked: "Jul 14, 2026",
    accent: "linear-gradient(135deg, #ffedd5, #fef3c7)",
  },
  {
    id: "book-nook-textbooks",
    business: businesses[7],
    title: "Buyback bonus with student ID",
    category: "Shopping",
    address: "305 University Avenue",
    distance: "1.6 mi",
    verificationStatus: "pending-review",
    lastChecked: "Jul 6, 2026",
    accent: "linear-gradient(135deg, #ede9fe, #e0e7ff)",
  },
];

export const verificationLabels: Record<VerificationStatus, string> = {
  "business-verified": "Business verified",
  "student-confirmed": "Student confirmed",
  "official-source": "Official source found",
  "pending-review": "Pending review",
  "possibly-outdated": "Possibly outdated",
};
