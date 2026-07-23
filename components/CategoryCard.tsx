import type { Category } from "@/types";
import { Icon } from "./Icon";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <a className="category-card" href={`/categories/${category.slug}`}>
      <span className="category-icon" style={{ background: category.color }}>
        <Icon name={category.icon} size={23} />
      </span>
      <span>{category.name}</span>
      <Icon className="category-arrow" name="chevron" size={17} />
    </a>
  );
}
