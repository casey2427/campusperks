"use client";

import { useState } from "react";
import Link from "next/link";
import { colleges } from "@/data/mock-data";
import { Icon } from "./Icon";

export function DiscountSubmissionForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="submission-success" role="status">
        <span className="submission-success-icon">
          <Icon name="check" size={30} />
        </span>
        <h1>Thanks for helping students save.</h1>
        <p>
          Your demo submission was received. In the full version, CampusPerks
          will review the discount before publishing it.
        </p>
        <div className="submission-success-actions">
          <button
            className="button button-primary section-button"
            onClick={() => setSubmitted(false)}
            type="button"
          >
            Submit another discount
          </button>
          <Link className="button secondary-button section-button" href="/">
            Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="discount-submission-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <div className="form-heading">
        <span className="form-icon"><Icon name="tag" size={25} /></span>
        <div>
          <p className="section-kicker">Student contribution</p>
          <h1>Submit a student discount</h1>
          <p>
            Found a deal near campus? Share what you know so other students can
            save too.
          </p>
        </div>
      </div>

      <div className="form-demo-note">
        <Icon name="shield" size={17} />
        Demo form: submissions are not saved yet.
      </div>

      <div className="form-grid">
        <label>
          <span>Business name</span>
          <input
            name="business"
            placeholder="Example: Campus Café"
            required
            type="text"
          />
        </label>

        <label>
          <span>Your college</span>
          <select defaultValue="" name="college" required>
            <option disabled value="">Choose your college</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.slug}>
                {college.shortName}
              </option>
            ))}
          </select>
        </label>

        <label className="form-full">
          <span>What is the discount?</span>
          <input
            name="discount"
            placeholder="Example: 15% off with a valid student ID"
            required
            type="text"
          />
        </label>

        <label>
          <span>Category</span>
          <select defaultValue="" name="category" required>
            <option disabled value="">Choose a category</option>
            <option>Food and drinks</option>
            <option>Shopping</option>
            <option>Fitness</option>
            <option>Entertainment</option>
            <option>Technology</option>
            <option>Travel</option>
            <option>Beauty</option>
            <option>Subscriptions</option>
          </select>
        </label>

        <label>
          <span>Business address</span>
          <input
            name="address"
            placeholder="Street address or neighborhood"
            required
            type="text"
          />
        </label>

        <label className="form-full">
          <span>Where did you find this discount?</span>
          <input
            name="source"
            placeholder="Business website, sign in store, employee, etc."
            required
            type="text"
          />
        </label>

        <label className="form-full">
          <span>Anything else students should know? <em>Optional</em></span>
          <textarea
            name="notes"
            placeholder="Add restrictions, expiration details, or redemption instructions."
            rows={4}
          />
        </label>
      </div>

      <p className="form-disclaimer">
        Please only submit information you believe is accurate. All deals
        should be reviewed before appearing publicly.
      </p>

      <button className="button button-primary form-submit" type="submit">
        Submit Discount <Icon name="arrow-right" size={18} />
      </button>
    </form>
  );
}
