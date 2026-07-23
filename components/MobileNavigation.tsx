"use client";

import Link from "next/link";
import { Icon } from "./Icon";
import { AuthNav } from "./AuthNav";

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  ["How It Works", "/#how-it-works"],
  ["Popular Discounts", "/#popular-discounts"],
  ["Categories", "/#categories"],
  ["For Businesses", "/#for-businesses"],
  ["Submit a Discount", "/submit-discount"],
];

export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  if (!open) return null;

  return (
    <div className="mobile-menu" id="mobile-navigation">
      <nav aria-label="Mobile navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href} onClick={onClose}>
            {label}
            <Icon name="chevron" size={17} />
          </Link>
        ))}
        <AuthNav variant="mobile" onNavigate={onClose} />
      </nav>
    </div>
  );
}
