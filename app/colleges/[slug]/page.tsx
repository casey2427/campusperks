import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollegeResults } from "@/components/CollegeResults";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { colleges } from "@/data/mock-data";

type CollegePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CollegePageProps): Promise<Metadata> {
  const { slug } = await params;
  const college = colleges.find((item) => item.slug === slug);

  if (!college) {
    return {
      title: "College not found | CampusPerks",
    };
  }

  const title = `Student Discounts Near ${college.shortName} | CampusPerks`;
  const description = `Browse sample student discounts near ${college.name} in ${college.location}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.campusperks.example/colleges/${college.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://www.campusperks.example/colleges/${college.slug}`,
    },
  };
}

export default async function CollegePage({
  params,
}: CollegePageProps) {
  const { slug } = await params;
  const college = colleges.find((item) => item.slug === slug);

  if (!college) {
    notFound();
  }

  return (
    <>
      <Header />
      <main>
        <CollegeResults college={college} />
      </main>
      <Footer />
    </>
  );
}
