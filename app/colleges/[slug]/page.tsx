import { Logo } from "@/components/Logo";
import { colleges } from "@/data/mock-data";

export default async function CollegePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const college = colleges.find((item) => item.slug === slug);
  const collegeName = college?.shortName ?? "this college";

  return (
    <main className="placeholder-shell">
      <Logo />
      <div className="placeholder-card">
        <span className="placeholder-pill">Coming soon</span>
        <h1>CampusPerks deals for {collegeName} are coming soon.</h1>
        <p>
          This is a placeholder college page. We&apos;ll connect real nearby
          deals in a future version.
        </p>
        <a className="button button-primary section-button" href="/">
          Back to homepage
        </a>
      </div>
    </main>
  );
}
