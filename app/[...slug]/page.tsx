import { Logo } from "@/components/Logo";

const labels: Record<string, { title: string; description: string }> = {
  login: { title: "Log in is coming soon.", description: "Authentication is intentionally not connected in this first frontend version." },
  signup: { title: "Sign up is coming soon.", description: "Student accounts will be added in a future version." },
  discounts: { title: "The full discount directory is coming soon.", description: "The homepage currently uses clearly labeled mock listings." },
  categories: { title: "Category browsing is coming soon.", description: "This placeholder will later show discounts filtered by category." },
  "submit-discount": { title: "Discount submissions are coming soon.", description: "Students will eventually be able to share deals with their campus community." },
  "for-businesses": { title: "Business listings are coming soon.", description: "Businesses will eventually be able to submit, claim, and manage student offers." },
  report: { title: "Deal reporting is coming soon.", description: "This placeholder will later let students flag outdated information." },
};

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const section = slug[0] ?? "";
  const fallbackTitle = `${section
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())} is coming soon.`;
  const content = labels[section] ?? {
    title: fallbackTitle,
    description:
      "This route is ready for the next phase of the CampusPerks build.",
  };

  return (
    <main className="placeholder-shell">
      <Logo />
      <div className="placeholder-card">
        <span className="placeholder-pill">Coming soon</span>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <a className="button button-primary section-button" href="/">
          Back to homepage
        </a>
      </div>
    </main>
  );
}
