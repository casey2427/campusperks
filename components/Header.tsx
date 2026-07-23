"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { MobileNavigation } from "./MobileNavigation";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <header className="site-header">
      <div className="header-wide header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#how-it-works">How It Works</a>
          <a href="#popular-discounts">Popular Discounts</a>
          <a href="#categories">Categories</a>
          <a href="#for-businesses">For Businesses</a>
          <Link className="submit-nav-link" href="/submit-discount">
            Submit a Discount
          </Link>
        </nav>
        <div className="header-actions">
          <Link className="login-link" href="/login">Log In</Link>
          <Link className="button button-primary signup-button" href="/signup">Sign Up</Link>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={open}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            className="menu-button"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <Icon name={open ? "close" : "menu"} size={23} />
          </button>
        </div>
      </div>
      <MobileNavigation open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
