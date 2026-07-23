"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { colleges, collegeDiscounts, verificationLabels } from "@/data/mock-data";
import type { College, VerificationStatus } from "@/types";
import { DealCard } from "./DealCard";
import { Icon } from "./Icon";

type SortOption = "distance" | "recent" | "business";

const verificationOptions = Object.entries(verificationLabels) as [
  VerificationStatus,
  string,
][];

function distanceValue(distance: string) {
  return Number.parseFloat(distance) || Number.POSITIVE_INFINITY;
}

export function CollegeResults({ college }: { college: College }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [verification, setVerification] = useState("all");
  const [sort, setSort] = useState<SortOption>("distance");

  const availableCategories = useMemo(
    () => ["All", ...new Set(collegeDiscounts.map((deal) => deal.category))],
    [],
  );

  const filteredDeals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return collegeDiscounts
      .filter((deal) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            deal.business.name,
            deal.title,
            deal.category,
            deal.address,
          ].some((value) => value.toLowerCase().includes(normalizedQuery));
        const matchesCategory =
          category === "All" || deal.category === category;
        const matchesVerification =
          verification === "all" ||
          deal.verificationStatus === verification;

        return matchesQuery && matchesCategory && matchesVerification;
      })
      .sort((a, b) => {
        if (sort === "recent") {
          return (
            new Date(b.lastChecked).getTime() -
            new Date(a.lastChecked).getTime()
          );
        }

        if (sort === "business") {
          return a.business.name.localeCompare(b.business.name);
        }

        return distanceValue(a.distance) - distanceValue(b.distance);
      });
  }, [category, query, sort, verification]);

  const filtersAreActive =
    query !== "" ||
    category !== "All" ||
    verification !== "all" ||
    sort !== "distance";

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setVerification("all");
    setSort("distance");
  }

  return (
    <>
      <section className="college-results-hero">
        <div className="college-results-glow college-results-glow-left" />
        <div className="college-results-glow college-results-glow-right" />
        <div className="container college-results-hero-inner">
          <a className="college-back-link" href="/">
            <span aria-hidden="true">←</span> Search another college
          </a>

          <div className="college-results-heading">
            <span className="college-monogram" aria-hidden="true">
              {college.shortName
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 3)}
            </span>
            <div>
              <span className="college-demo-pill">Demo results</span>
              <h1>Student discounts near {college.shortName}</h1>
              <p>
                Explore sample offers near {college.name} in {college.location}.
                Real listings and distances will be added in a future version.
              </p>
            </div>
          </div>

          <div className="college-quick-info" aria-label="Results overview">
            <div>
              <strong>{collegeDiscounts.length}</strong>
              <span>Sample deals</span>
            </div>
            <div>
              <strong>{availableCategories.length - 1}</strong>
              <span>Categories</span>
            </div>
            <div>
              <Icon name="pin" size={18} />
              <span>{college.location}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="college-results-section" aria-labelledby="deal-results-heading">
        <div className="container">
          <div className="college-results-toolbar">
            <div className="college-switcher">
              <label htmlFor="college-switcher">College or university</label>
              <select
                id="college-switcher"
                onChange={(event) =>
                  router.push(`/colleges/${event.target.value}`)
                }
                value={college.slug}
              >
                {colleges.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.shortName} — {item.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="results-search-field">
              <label className="sr-only" htmlFor="deal-search">
                Search deals
              </label>
              <Icon name="search" size={20} />
              <input
                id="deal-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search businesses or discounts"
                type="search"
                value={query}
              />
              {query && (
                <button
                  aria-label="Clear deal search"
                  onClick={() => setQuery("")}
                  type="button"
                >
                  <Icon name="close" size={17} />
                </button>
              )}
            </div>
          </div>

          <div className="college-category-filter" aria-label="Filter by category">
            {availableCategories.map((item) => (
              <button
                aria-pressed={category === item}
                className={category === item ? "active" : ""}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="college-filter-row">
            <div className="college-select-filter">
              <label htmlFor="verification-filter">Verification</label>
              <select
                id="verification-filter"
                onChange={(event) => setVerification(event.target.value)}
                value={verification}
              >
                <option value="all">All statuses</option>
                {verificationOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="college-select-filter">
              <label htmlFor="sort-results">Sort by</label>
              <select
                id="sort-results"
                onChange={(event) => setSort(event.target.value as SortOption)}
                value={sort}
              >
                <option value="distance">Distance</option>
                <option value="recent">Recently checked</option>
                <option value="business">Business name</option>
              </select>
            </div>

            {filtersAreActive && (
              <button
                className="clear-results-filters"
                onClick={clearFilters}
                type="button"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="college-results-count">
            <div>
              <span className="eyebrow">Browse demo listings</span>
              <h2 id="deal-results-heading">
                {filteredDeals.length}{" "}
                {filteredDeals.length === 1 ? "discount" : "discounts"} found
              </h2>
            </div>
            <a href="/submit-discount">
              Know another deal? <strong>Submit it</strong>
            </a>
          </div>

          {filteredDeals.length > 0 ? (
            <div className="college-deals-grid">
              {filteredDeals.map((discount) => (
                <DealCard discount={discount} key={discount.id} />
              ))}
            </div>
          ) : (
            <div className="college-empty-state">
              <span className="college-empty-icon">
                <Icon name="search" size={26} />
              </span>
              <h2>No demo deals match those filters</h2>
              <p>
                Try a different search term or clear the filters to see every
                sample listing near {college.shortName}.
              </p>
              <button
                className="button button-primary"
                onClick={clearFilters}
                type="button"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="college-contribute-section">
        <div className="container college-contribute-card">
          <div>
            <span className="eyebrow">Students helping students</span>
            <h2>Found a discount near {college.shortName}?</h2>
            <p>
              Share it with the CampusPerks community. Submissions stay in
              review until they can be checked.
            </p>
          </div>
          <a className="button button-primary" href="/submit-discount">
            Submit a Discount <Icon name="arrow-right" size={17} />
          </a>
        </div>
      </section>
    </>
  );
}
