"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { colleges } from "@/data/mock-data";
import type { College } from "@/types";
import { CollegeAutocomplete } from "./CollegeAutocomplete";
import { Icon } from "./Icon";

export function CollegeSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<College | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filtered, setFiltered] = useState<College[]>(colleges);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const term = query.trim().toLowerCase();
      const matches = colleges.filter((college) =>
        `${college.name} ${college.shortName} ${college.location}`
          .toLowerCase()
          .includes(term),
      );
      setFiltered(matches);
      setLoading(false);
      setActiveIndex(0);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  const chooseCollege = (college: College) => {
    setSelected(college);
    setQuery(college.shortName);
    setOpen(false);
    inputRef.current?.focus();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const college =
      selected ??
      filtered.find(
        (item) =>
          item.name.toLowerCase() === query.toLowerCase() ||
          item.shortName.toLowerCase() === query.toLowerCase(),
      );
    if (college) {
      router.push(`/colleges/${college.slug}`);
    } else {
      setOpen(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((value) => Math.min(value + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter" && open && filtered[activeIndex]) {
      event.preventDefault();
      chooseCollege(filtered[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const useLocation = () => {
    setLocationMessage("Requesting your location…");
    setLocationError(false);
    if (!navigator.geolocation) {
      setLocationError(true);
      setLocationMessage("Location is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationError(false);
        setLocationMessage("Location detected. Finding colleges near you.");
      },
      () => {
        setLocationError(true);
        setLocationMessage(
          "We couldn’t access your location. You can still search by college name.",
        );
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  return (
    <div className="college-search-wrap" id="college-search">
      <form className="college-search" onSubmit={submit} role="search">
        <div className="search-input-area">
          <Icon className="search-icon" name="search" size={24} />
          <label className="sr-only" htmlFor="college-input">
            Enter your college or university
          </label>
          <input
            aria-activedescendant={
              open && filtered[activeIndex]
                ? `college-option-${filtered[activeIndex].id}`
                : undefined
            }
            aria-autocomplete="list"
            aria-controls="college-listbox"
            aria-expanded={open}
            autoComplete="off"
            id="college-input"
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onChange={(event) => {
              setLoading(true);
              setQuery(event.target.value);
              setSelected(null);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your college or university"
            ref={inputRef}
            role="combobox"
            type="text"
            value={query}
          />
          {query && (
            <button
              aria-label="Clear college search"
              className="clear-search"
              onClick={() => {
                setLoading(true);
                setQuery("");
                setSelected(null);
                setOpen(true);
              }}
              type="button"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>
        <button className="button button-primary find-button" type="submit">
          Find Discounts
          <Icon name="arrow-right" size={18} />
        </button>
        {open && (
          <CollegeAutocomplete
            activeIndex={activeIndex}
            colleges={filtered}
            loading={loading}
            onSelect={chooseCollege}
          />
        )}
      </form>

      <button className="location-button" onClick={useLocation} type="button">
        <span className="location-icon">
          <Icon name="navigation" size={14} />
        </span>
        Use my current location
      </button>
      {locationMessage && (
        <p
          className={`location-status ${locationError ? "error" : ""}`}
          role="status"
        >
          {locationMessage}
        </p>
      )}
    </div>
  );
}
