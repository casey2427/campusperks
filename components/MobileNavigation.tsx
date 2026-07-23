"use client";

import Link from "next/link";
import { Icon } from "./Icon";

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  ["How It Works", "#how-it-works"],
  ["Popular Discounts", "#popular-discounts"],
  ["Categories", "#categories"],
  ["For Businesses", "#for-businesses"],
];

export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  if (!open) return null;

  return (
    <div className="mobile-menu" id="mobile-navigation">
      <nav aria-label="Mobile navigation">
        {links.map(([label, href]) => (
          <a key={href} href={href} onClick={onClose}>
            {label}
            <Icon name="chevron" size={17} />
          </a>
        ))}
        <Link href="/login" onClick={onClose}>Log In</Link>
        <Link className="button button-primary mobile-signup" href="/signup" onClick={onClose}>
          Sign Up
        </Link>
      </nav>
    </div>
  );
}
