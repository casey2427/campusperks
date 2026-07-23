"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { colleges } from "@/data/mock-data";
import {
  findNearestCollege,
  saveNearbyLocation,
  type NearbyLocation,
} from "@/lib/location";
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
  const [locating, setLocating] = useState(false);

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
    setLocating(true);
    if (!navigator.geolocation) {
      setLocationError(true);
      setLocationMessage("Location is not supported in this browser.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearbyLocation: NearbyLocation = {
          latitude: Number(position.coords.latitude.toFixed(4)),
          longitude: Number(position.coords.longitude.toFixed(4)),
          detectedAt: Date.now(),
        };
        const nearest = findNearestCollege(nearbyLocation, colleges);

        if (!nearest) {
          setLocationError(true);
          setLocationMessage("We couldn’t find a supported college near you.");
          setLocating(false);
          return;
        }

        if (nearest.distance > 100) {
          setLocationError(true);
          setLocationMessage(
            `CampusPerks isn’t near your area yet. The closest supported school is ${nearest.college.shortName}, about ${Math.round(nearest.distance)} miles away.`,
          );
          setLocating(false);
          return;
        }

        saveNearbyLocation(nearbyLocation);
        setLocationError(false);
        setLocationMessage(
          `Location detected. Opening recommended deals near ${nearest.college.shortName}.`,
        );
        setLocating(false);
        router.push(`/colleges/${nearest.college.slug}`);
      },
      (locationRequestError) => {
        setLocationError(true);
        setLocationMessage(
          locationRequestError.code === locationRequestError.PERMISSION_DENIED
            ? "Location permission was denied. You can still search by college name."
            : "We couldn’t detect your location. You can still search by college name.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 },
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

      <button
        className="location-button"
        disabled={locating}
        onClick={useLocation}
        type="button"
      >
        <span className="location-icon">
          <Icon name="navigation" size={14} />
        </span>
        {locating ? "Detecting location…" : "Use my current location"}
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
