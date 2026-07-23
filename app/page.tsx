import Link from "next/link";
import { BenefitCard } from "@/components/BenefitCard";
import { BusinessCTA } from "@/components/BusinessCTA";
import { CategoryCard } from "@/components/CategoryCard";
import { CollegeSearch } from "@/components/CollegeSearch";
import { DealCard } from "@/components/DealCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HowItWorks } from "@/components/HowItWorks";
import { Icon } from "@/components/Icon";
import { PopularBrandCard } from "@/components/PopularBrandCard";
import { SubmissionCTA } from "@/components/SubmissionCTA";
import { benefits, brands, categories, discounts } from "@/data/mock-data";

export default function Home() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CampusPerks",
    url: "https://www.campusperks.example",
    logo: "https://www.campusperks.example/favicon.svg",
    description:
      "A student discount discovery platform for finding deals near college campuses.",
  };

  return (
    <>
      <Header />
      <main>
        <section className="hero-shell" aria-labelledby="hero-heading">
          <div className="hero-glow hero-glow-left" />
          <div className="hero-glow hero-glow-right" />
          <div className="orbit-icon orbit-icon-left" aria-hidden="true">
            <Icon name="bag" size={22} />
          </div>
          <div className="orbit-icon orbit-icon-right" aria-hidden="true">
            <Icon name="percent" size={22} />
          </div>

          <div className="container hero-content">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Free for every student
            </p>
            <h1 id="hero-heading">
              Your college.
              <br />
              Every nearby <span className="gradient-text">student discount.</span>
            </h1>
            <p className="hero-copy">
              Enter your college and discover exclusive student discounts near
              you, just for students.
            </p>
            <CollegeSearch />
          </div>
        </section>

        <section
          id="popular-discounts"
          className="popular-section section-anchor"
          aria-labelledby="popular-heading"
        >
          <div className="container">
            <div className="section-heading-row compact">
              <div>
                <p className="section-kicker">Explore the possibilities</p>
                <h2 id="popular-heading">Popular nearby discounts</h2>
              </div>
              <Link className="text-link desktop-see-all" href="/discounts">
                See all <Icon name="arrow-right" size={17} />
              </Link>
            </div>
            <p className="demo-note">
              Featured brands shown as development examples. Offers are not yet
              verified.
            </p>
            <div className="brand-scroll" aria-label="Featured sample brands">
              {brands.map((brand) => (
                <PopularBrandCard key={brand.id} brand={brand} />
              ))}
            </div>
            <Link className="text-link mobile-see-all" href="/discounts">
              See all discounts <Icon name="arrow-right" size={17} />
            </Link>
          </div>
        </section>

        <section className="benefits-wrap" aria-label="CampusPerks benefits">
          <div className="container benefits-grid">
            {benefits.map((benefit) => (
              <BenefitCard key={benefit.title} {...benefit} />
            ))}
          </div>
        </section>

        <HowItWorks />

        <section
          className="categories-section section-anchor"
          id="categories"
          aria-labelledby="categories-heading"
        >
          <div className="container">
            <div className="section-heading-centered">
              <p className="section-kicker">Save on the things you use</p>
              <h2 id="categories-heading">Explore student discounts</h2>
              <p>
                Browse the categories students care about most, from everyday
                essentials to weekend plans.
              </p>
            </div>
            <div className="categories-grid">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>

        <section
          className="deals-section"
          id="featured-deals"
          aria-labelledby="featured-deals-heading"
        >
          <div className="container">
            <div className="section-heading-row">
              <div>
                <p className="section-kicker">Demo listings</p>
                <h2 id="featured-deals-heading">Featured deals near campus</h2>
                <p className="section-description">
                  A preview of how local offers will appear. Every listing below
                  uses mock data and is not an active offer.
                </p>
              </div>
              <Link className="text-link desktop-see-all" href="/discounts">
                Browse all <Icon name="arrow-right" size={17} />
              </Link>
            </div>
            <div className="deal-scroll" aria-label="Demo student deals">
              {discounts.map((discount) => (
                <DealCard key={discount.id} discount={discount} />
              ))}
            </div>
          </div>
        </section>

        <SubmissionCTA />
        <BusinessCTA />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
