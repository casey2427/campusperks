"use client";

import type { College } from "@/types";

interface CollegeAutocompleteProps {
  colleges: College[];
  activeIndex: number;
  loading: boolean;
  onSelect: (college: College) => void;
}

export function CollegeAutocomplete({
  colleges,
  activeIndex,
  loading,
  onSelect,
}: CollegeAutocompleteProps) {
  return (
    <div
      className="autocomplete"
      id="college-listbox"
      role="listbox"
      aria-label="College suggestions"
    >
      {loading ? (
        <div className="autocomplete-state">
          <span className="spinner" /> Searching colleges…
        </div>
      ) : colleges.length === 0 ? (
        <div className="autocomplete-state">
          <strong>No colleges found</strong>
          <span>Try the full school name or a different spelling.</span>
        </div>
      ) : (
        colleges.map((college, index) => (
          <button
            aria-selected={activeIndex === index}
            className={activeIndex === index ? "active" : ""}
            id={`college-option-${college.id}`}
            key={college.id}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(college)}
            role="option"
            type="button"
          >
            <span className="college-monogram">{college.shortName.slice(0, 2)}</span>
            <span className="college-option-copy">
              <strong>{college.shortName}</strong>
              <span>{college.name} · {college.location}</span>
            </span>
          </button>
        ))
      )}
    </div>
  );
}
