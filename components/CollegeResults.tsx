"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { colleges, collegeDiscounts, verificationLabels } from "@/data/mock-data";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import {
  clearNearbyLocation,
  distanceBetweenMiles,
  findNearestCollege,
  readNearbyLocation,
  saveNearbyLocation,
  type NearbyLocation,
} from "@/lib/location";
import type {
  Business,
  College,
  Discount,
  VerificationStatus,
} from "@/types";
import { DealCard } from "./DealCard";
import { Icon } from "./Icon";

type SortOption =
  | "recommended"
  | "distance"
  | "helpful"
  | "recent"
  | "business";
type DataSource = "loading" | "database" | "mock";

type DbCollege = {
  id: string;
};

type DbDiscountCollege = {
  discount_id: string;
  distance_miles: number | string | null;
};

type DbDiscount = {
  id: string;
  business_id: string;
  title: string;
  category: string;
  address: string;
  verification_status: string;
  last_checked_at: string | null;
  helpful_count: number | null;
  not_helpful_count: number | null;
  is_demo: boolean | null;
};

type DbBusiness = {
  id: string;
  name: string;
  slug: string | null;
};

type DbVote = {
  discount_id: string;
  value: number;
};

type DbSave = {
  discount_id: string;
};

const verificationOptions = Object.entries(verificationLabels) as [
  VerificationStatus,
  string,
][];

const verificationWeights: Record<VerificationStatus, number> = {
  "business-verified": 45,
  "official-source": 42,
  "student-confirmed": 30,
  "pending-review": 12,
  "possibly-outdated": -100,
};

const businessColors = [
  "#6d4de8",
  "#0f766e",
  "#be185d",
  "#2563eb",
  "#c2410c",
  "#4f46e5",
  "#15803d",
  "#9333ea",
];

const categoryAccents: Record<string, string> = {
  "Food and drinks": "linear-gradient(135deg, #ede9fe, #dbeafe)",
  Fitness: "linear-gradient(135deg, #d1fae5, #e0f2fe)",
  Entertainment: "linear-gradient(135deg, #fce7f3, #f3e8ff)",
  Technology: "linear-gradient(135deg, #dbeafe, #eef2ff)",
  Travel: "linear-gradient(135deg, #ffedd5, #fef3c7)",
  Shopping: "linear-gradient(135deg, #ede9fe, #e0e7ff)",
  Beauty: "linear-gradient(135deg, #fce7f3, #ffe4e6)",
  Subscriptions: "linear-gradient(135deg, #e0e7ff, #ede9fe)",
};

function distanceValue(distance: string) {
  const parsed = Number.parseFloat(distance);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function normalizeVerification(value: string): VerificationStatus {
  const normalized = value.replaceAll("_", "-") as VerificationStatus;
  return normalized in verificationLabels ? normalized : "pending-review";
}

function businessInitials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function businessColor(id: string) {
  const total = Array.from(id).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return businessColors[total % businessColors.length];
}

function formatCheckedDate(value: string | null) {
  if (!value) return "Not checked yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not checked yet";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function recommendedScore(discount: Discount) {
  const checkedAt = new Date(discount.lastChecked).getTime();
  const daysSinceCheck = Number.isNaN(checkedAt)
    ? Number.POSITIVE_INFINITY
    : Math.max(0, (Date.now() - checkedAt) / 86_400_000);
  const recencyPoints = daysSinceCheck <= 7 ? 10 : daysSinceCheck <= 30 ? 5 : 0;
  const feedbackSignal =
    (discount.helpfulCount ?? 0) - (discount.notHelpfulCount ?? 0) * 1.5;
  const feedbackPoints = Math.max(-25, Math.min(25, feedbackSignal * 2));
  const distance = distanceValue(discount.distance);
  const distancePoints = Number.isFinite(distance)
    ? Math.max(0, 20 - distance * 5)
    : 0;

  return (
    verificationWeights[discount.verificationStatus] +
    feedbackPoints +
    distancePoints +
    recencyPoints
  );
}

function helpfulScore(discount: Discount) {
  return (
    (discount.helpfulCount ?? 0) - (discount.notHelpfulCount ?? 0) * 1.5
  );
}

export function CollegeResults({ college }: { college: College }) {
  const router = useRouter();
  const [deals, setDeals] = useState<Discount[]>(collegeDiscounts);
  const [dataSource, setDataSource] = useState<DataSource>(
    isSupabaseConfigured() ? "loading" : "mock",
  );
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, -1 | 1>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [busyActions, setBusyActions] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [verification, setVerification] = useState("all");
  const [sort, setSort] = useState<SortOption>("recommended");
  const [nearbyLocation, setNearbyLocation] =
    useState<NearbyLocation | null>(null);
  const [locationError, setLocationError] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNearbyLocation(readNearbyLocation());
    }, 0);

    return () => window.clearTimeout(timer);
  }, [college.slug]);

  useEffect(() => {
    let isActive = true;

    async function loadDeals() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setDataSource("mock");
        return;
      }

      try {
        const { data: collegeData, error: collegeError } = await supabase
          .from("colleges")
          .select("id")
          .eq("slug", college.slug)
          .maybeSingle();

        if (collegeError) throw collegeError;

        const databaseCollege = collegeData as DbCollege | null;
        if (!databaseCollege) {
          throw new Error("This college is not available in the database yet.");
        }

        const { data: mappingData, error: mappingError } = await supabase
          .from("discount_colleges")
          .select("discount_id, distance_miles")
          .eq("college_id", databaseCollege.id);

        if (mappingError) throw mappingError;

        const mappings = (mappingData ?? []) as DbDiscountCollege[];
        const discountIds = mappings.map((item) => item.discount_id);

        if (discountIds.length === 0) {
          if (!isActive) return;
          setDeals([]);
          setDataSource("database");
          setCurrentUserId(
            (await supabase.auth.getUser()).data.user?.id ?? null,
          );
          return;
        }

        const { data: discountData, error: discountError } = await supabase
          .from("discounts")
          .select(
            "id, business_id, title, category, address, verification_status, last_checked_at, helpful_count, not_helpful_count, is_demo",
          )
          .in("id", discountIds)
          .eq("status", "active");

        if (discountError) throw discountError;

        const discountRows = (discountData ?? []) as DbDiscount[];
        const businessIds = [
          ...new Set(discountRows.map((item) => item.business_id)),
        ];
        const { data: businessData, error: businessError } = await supabase
          .from("businesses")
          .select("id, name, slug")
          .in("id", businessIds);

        if (businessError) throw businessError;

        const businessRows = (businessData ?? []) as DbBusiness[];
        const businessesById = new Map(
          businessRows.map((item) => [item.id, item]),
        );
        const distancesById = new Map(
          mappings.map((item) => [
            item.discount_id,
            item.distance_miles === null
              ? "Distance unavailable"
              : `${Number(item.distance_miles).toFixed(1)} mi`,
          ]),
        );

        const mappedDeals = discountRows
          .map((item): Discount | null => {
            const businessRow = businessesById.get(item.business_id);
            if (!businessRow) return null;

            const business: Business = {
              id: businessRow.id,
              name: businessRow.name,
              slug: businessRow.slug ?? businessRow.id,
              initials: businessInitials(businessRow.name),
              color: businessColor(businessRow.id),
            };

            return {
              id: item.id,
              business,
              title: item.title,
              category: item.category,
              address: item.address,
              distance: distancesById.get(item.id) ?? "Distance unavailable",
              verificationStatus: normalizeVerification(
                item.verification_status,
              ),
              lastChecked: formatCheckedDate(item.last_checked_at),
              accent:
                categoryAccents[item.category] ??
                "linear-gradient(135deg, #ede9fe, #dbeafe)",
              helpfulCount: item.helpful_count ?? 0,
              notHelpfulCount: item.not_helpful_count ?? 0,
              isDemo: item.is_demo ?? false,
            };
          })
          .filter((item): item is Discount => item !== null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isActive) return;

        setDeals(mappedDeals);
        setDataSource("database");
        setCurrentUserId(user?.id ?? null);
        setLoadError("");

        if (user && mappedDeals.length > 0) {
          const ids = mappedDeals.map((item) => item.id);
          const [{ data: voteData }, { data: saveData }] = await Promise.all([
            supabase
              .from("votes")
              .select("discount_id, value")
              .eq("user_id", user.id)
              .in("discount_id", ids),
            supabase
              .from("saves")
              .select("discount_id")
              .eq("user_id", user.id)
              .in("discount_id", ids),
          ]);

          if (!isActive) return;

          const nextVotes: Record<string, -1 | 1> = {};
          ((voteData ?? []) as DbVote[]).forEach((vote) => {
            if (vote.value === 1 || vote.value === -1) {
              nextVotes[vote.discount_id] = vote.value;
            }
          });
          setUserVotes(nextVotes);
          setSavedIds(
            new Set(
              ((saveData ?? []) as DbSave[]).map((save) => save.discount_id),
            ),
          );
        }
      } catch (error) {
        if (!isActive) return;
        setDeals(collegeDiscounts);
        setDataSource("mock");
        setLoadError(
          error instanceof Error
            ? `The database could not be loaded: ${error.message}`
            : "The database could not be loaded. Showing preview data instead.",
        );
      }
    }

    loadDeals();

    return () => {
      isActive = false;
    };
  }, [college.slug]);

  const availableCategories = useMemo(
    () => ["All", ...new Set(deals.map((deal) => deal.category))],
    [deals],
  );

  const filteredDeals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return deals
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
        if (sort === "recommended") {
          return recommendedScore(b) - recommendedScore(a);
        }

        if (sort === "recent") {
          return (
            new Date(b.lastChecked).getTime() -
            new Date(a.lastChecked).getTime()
          );
        }

        if (sort === "helpful") {
          return (
            helpfulScore(b) - helpfulScore(a) ||
            recommendedScore(b) - recommendedScore(a)
          );
        }

        if (sort === "business") {
          return a.business.name.localeCompare(b.business.name);
        }

        return distanceValue(a.distance) - distanceValue(b.distance);
      });
  }, [category, deals, query, sort, verification]);

  const filtersAreActive =
    query !== "" ||
    category !== "All" ||
    verification !== "all" ||
    sort !== "recommended";

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setVerification("all");
    setSort("recommended");
  }

  function requireLogin() {
    router.push(`/login?next=/colleges/${college.slug}`);
  }

  function requestNearbyLocation() {
    setLocationError("");
    setLocating(true);

    if (!navigator.geolocation) {
      setLocationError("Location is not supported in this browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: NearbyLocation = {
          latitude: Number(position.coords.latitude.toFixed(4)),
          longitude: Number(position.coords.longitude.toFixed(4)),
          detectedAt: Date.now(),
        };
        const nearest = findNearestCollege(location, colleges);

        if (!nearest || nearest.distance > 100) {
          setLocationError(
            nearest
              ? `CampusPerks isn’t near your area yet. ${nearest.college.shortName} is the closest supported school.`
              : "We couldn’t find a supported college near you.",
          );
          setLocating(false);
          return;
        }

        saveNearbyLocation(location);
        setNearbyLocation(location);
        setSort("recommended");
        setLocating(false);

        if (nearest.college.slug !== college.slug) {
          router.push(`/colleges/${nearest.college.slug}`);
        }
      },
      (locationRequestError) => {
        setLocationError(
          locationRequestError.code === locationRequestError.PERMISSION_DENIED
            ? "Location permission was denied. Campus-distance sorting is still available."
            : "We couldn’t detect your location. Campus-distance sorting is still available.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 },
    );
  }

  function stopUsingNearbyLocation() {
    clearNearbyLocation();
    setNearbyLocation(null);
    setLocationError("");
  }

  function setBusy(key: string, busy: boolean) {
    setBusyActions((current) => {
      const next = new Set(current);
      if (busy) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  async function handleVote(discountId: string, value: -1 | 1) {
    if (!currentUserId) {
      requireLogin();
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase || dataSource !== "database") return;

    const key = `vote:${discountId}`;
    const previousVote = userVotes[discountId];
    setBusy(key, true);
    setActionError("");

    const result =
      previousVote === value
        ? await supabase
            .from("votes")
            .delete()
            .eq("user_id", currentUserId)
            .eq("discount_id", discountId)
        : await supabase.from("votes").upsert(
            {
              user_id: currentUserId,
              discount_id: discountId,
              value,
            },
            { onConflict: "user_id,discount_id" },
          );

    if (result.error) {
      setActionError(result.error.message);
      setBusy(key, false);
      return;
    }

    setUserVotes((current) => {
      const next = { ...current };
      if (previousVote === value) delete next[discountId];
      else next[discountId] = value;
      return next;
    });

    setDeals((current) =>
      current.map((deal) => {
        if (deal.id !== discountId) return deal;

        let helpfulCount = deal.helpfulCount ?? 0;
        let notHelpfulCount = deal.notHelpfulCount ?? 0;

        if (previousVote === 1) helpfulCount = Math.max(0, helpfulCount - 1);
        if (previousVote === -1) {
          notHelpfulCount = Math.max(0, notHelpfulCount - 1);
        }
        if (previousVote !== value) {
          if (value === 1) helpfulCount += 1;
          if (value === -1) notHelpfulCount += 1;
        }

        return { ...deal, helpfulCount, notHelpfulCount };
      }),
    );
    setBusy(key, false);
  }

  async function handleSave(discountId: string) {
    if (!currentUserId) {
      requireLogin();
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase || dataSource !== "database") return;

    const key = `save:${discountId}`;
    const isSaved = savedIds.has(discountId);
    setBusy(key, true);
    setActionError("");

    const result = isSaved
      ? await supabase
          .from("saves")
          .delete()
          .eq("user_id", currentUserId)
          .eq("discount_id", discountId)
      : await supabase.from("saves").insert({
          user_id: currentUserId,
          discount_id: discountId,
        });

    if (result.error) {
      setActionError(result.error.message);
      setBusy(key, false);
      return;
    }

    setSavedIds((current) => {
      const next = new Set(current);
      if (isSaved) next.delete(discountId);
      else next.add(discountId);
      return next;
    });
    setBusy(key, false);
  }

  const isDatabaseData = dataSource === "database";
  const allDealsAreDemo = deals.length > 0 && deals.every((deal) => deal.isDemo);
  const distanceToCampus = nearbyLocation
    ? distanceBetweenMiles(nearbyLocation, college)
    : null;

  return (
    <>
      <section className="college-results-hero">
        <div className="college-results-glow college-results-glow-left" />
        <div className="college-results-glow college-results-glow-right" />
        <div className="container college-results-hero-inner">
          <Link className="college-back-link" href="/">
            <span aria-hidden="true">←</span> Search another college
          </Link>

          <div className="college-results-heading">
            <span className="college-monogram" aria-hidden="true">
              {college.shortName
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 3)}
            </span>
            <div>
              <span className="college-demo-pill">
                {dataSource === "loading"
                  ? "Loading listings"
                  : allDealsAreDemo || dataSource === "mock"
                    ? "Demo results"
                    : "CampusPerks results"}
              </span>
              <h1>Student discounts near {college.shortName}</h1>
              <p>
                Browse nearby student offers, sort by trusted community
                recommendations, and help classmates by confirming what works.
                Development listings remain clearly labeled as demo data.
              </p>
            </div>
          </div>

          <div className="college-quick-info" aria-label="Results overview">
            <div>
              <strong>{dataSource === "loading" ? "—" : deals.length}</strong>
              <span>{allDealsAreDemo ? "Demo deals" : "Deals"}</span>
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

      <section
        className="college-results-section"
        aria-labelledby="deal-results-heading"
      >
        <div className="container">
          {nearbyLocation ? (
            <div className="college-nearby-banner">
              <span className="college-nearby-icon">
                <Icon name="navigation" size={18} />
              </span>
              <div>
                <strong>Recommended near you is active</strong>
                <span>
                  {distanceToCampus !== null
                    ? `You’re approximately ${
                        distanceToCampus < 1
                          ? "less than 1"
                          : Math.round(distanceToCampus)
                      } mile${distanceToCampus >= 1.5 ? "s" : ""} from ${
                        college.shortName
                      }. `
                    : ""}
                  Your exact location is kept only for this browser session.
                </span>
              </div>
              <button onClick={stopUsingNearbyLocation} type="button">
                Turn off
              </button>
            </div>
          ) : (
            <div className="college-nearby-prompt">
              <span className="college-nearby-icon">
                <Icon name="navigation" size={18} />
              </span>
              <div>
                <strong>Rank deals around your closest campus</strong>
                <span>
                  Use your location to select the nearest supported college.
                  CampusPerks does not permanently store it.
                </span>
              </div>
              <button
                disabled={locating}
                onClick={requestNearbyLocation}
                type="button"
              >
                {locating ? "Detecting…" : "Use my location"}
              </button>
            </div>
          )}

          {locationError && (
            <div className="college-data-message warning" role="alert">
              <Icon name="flag" size={17} />
              <span>{locationError}</span>
            </div>
          )}

          {loadError && (
            <div className="college-data-message warning" role="alert">
              <Icon name="flag" size={17} />
              <span>{loadError}</span>
            </div>
          )}

          {isDatabaseData && !currentUserId && (
            <div className="college-data-message">
              <Icon name="user" size={17} />
              <span>
                <Link href={`/login?next=/colleges/${college.slug}`}>
                  Log in
                </Link>{" "}
                to vote and save discounts. Browsing is open to everyone.
              </span>
            </div>
          )}

          {actionError && (
            <div className="college-data-message warning" role="alert">
              <Icon name="flag" size={17} />
              <span>{actionError}</span>
            </div>
          )}

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
                <option value="recommended">Recommended near you</option>
                <option value="distance">Closest to campus</option>
                <option value="helpful">Most helpful</option>
                <option value="recent">Recently verified</option>
                <option value="business">Business A–Z</option>
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

          {sort === "recommended" && (
            <div className="ranking-explainer" aria-label="How ranking works">
              <span>
                <Icon name="sparkles" size={15} />
                How Recommended near you ranks deals
              </span>
              <ul>
                <li>Verified evidence <strong>45%</strong></li>
                <li>Student feedback <strong>25%</strong></li>
                <li>Campus distance <strong>20%</strong></li>
                <li>Recently checked <strong>10%</strong></li>
              </ul>
            </div>
          )}

          <div className="college-results-count">
            <div>
              <span className="eyebrow">
                {dataSource === "loading"
                  ? "Loading database"
                  : isDatabaseData
                    ? "Community-ranked listings"
                    : "Browse preview listings"}
              </span>
              <h2 id="deal-results-heading">
                {dataSource === "loading"
                  ? "Loading discounts…"
                  : `${filteredDeals.length} ${
                      filteredDeals.length === 1 ? "discount" : "discounts"
                    } found`}
              </h2>
            </div>
            <Link href="/submit-discount">
              Know another deal? <strong>Submit it</strong>
            </Link>
          </div>

          {dataSource === "loading" ? (
            <div className="college-results-loading" role="status">
              <span />
              Loading discounts from CampusPerks…
            </div>
          ) : filteredDeals.length > 0 ? (
            <div className="college-deals-grid">
              {filteredDeals.map((discount) => (
                <DealCard
                  busy={
                    busyActions.has(`vote:${discount.id}`) ||
                    busyActions.has(`save:${discount.id}`)
                  }
                  discount={discount}
                  collegeSlug={college.slug}
                  key={discount.id}
                  onSave={
                    isDatabaseData
                      ? () => handleSave(discount.id)
                      : undefined
                  }
                  onVote={
                    isDatabaseData
                      ? (value) => handleVote(discount.id, value)
                      : undefined
                  }
                  saved={isDatabaseData ? savedIds.has(discount.id) : undefined}
                  userVote={userVotes[discount.id]}
                />
              ))}
            </div>
          ) : (
            <div className="college-empty-state">
              <span className="college-empty-icon">
                <Icon name="search" size={26} />
              </span>
              <h2>No discounts match those filters</h2>
              <p>
                Try a different search term or clear the filters to see every
                listing near {college.shortName}.
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
          <Link className="button button-primary" href="/submit-discount">
            Submit a Discount <Icon name="arrow-right" size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
