import { Icon } from "./Icon";

interface BenefitCardProps {
  title: string;
  description: string;
  icon: string;
}

export function BenefitCard({ title, description, icon }: BenefitCardProps) {
  return (
    <article className="benefit-card">
      <span className="benefit-icon">
        <Icon name={icon} size={23} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
