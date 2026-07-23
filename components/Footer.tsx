import { Logo } from "./Logo";

const groups = [
  {
    title: "Discover",
    links: [
      ["Browse Discounts", "/discounts"],
      ["Colleges", "/colleges"],
      ["Categories", "/categories"],
      ["Popular Deals", "/discounts#popular"],
    ],
  },
  {
    title: "Community",
    links: [
      ["Submit a Discount", "/submit-discount"],
      ["For Businesses", "/for-businesses"],
      ["How It Works", "/#how-it-works"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            Helping students discover useful discounts near the places they
            learn, live, shop, and eat.
          </p>
          <span className="footer-demo">Currently showing demo data</span>
        </div>
        {groups.map((group) => (
          <nav aria-label={group.title} key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => (
              <a href={href} key={label}>{label}</a>
            ))}
          </nav>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CampusPerks. All rights reserved.</span>
        <span>Made for students, with care.</span>
      </div>
    </footer>
  );
}
