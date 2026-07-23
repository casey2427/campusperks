import type { Brand } from "@/types";

export function PopularBrandCard({ brand }: { brand: Brand }) {
  return (
    <a
      className="brand-card"
      href={`/discounts/${brand.slug}`}
      aria-label={`View sample ${brand.name} discounts`}
    >
      <span className="sample-pill">Sample</span>
      <span className="brand-wordmark" style={{ color: brand.color }}>
        {brand.wordmark}
      </span>
    </a>
  );
}
