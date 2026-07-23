import Link from "next/link";

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="CampusPerks home">
      <span className="logo-mark" aria-hidden="true">
        <span className="logo-hole" />
      </span>
      <span>CampusPerks</span>
    </Link>
  );
}
