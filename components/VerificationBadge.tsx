import { verificationLabels } from "@/data/mock-data";
import type { VerificationStatus } from "@/types";
import { Icon } from "./Icon";

export function VerificationBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  return (
    <span className={`verification-badge status-${status}`}>
      <Icon name={status === "possibly-outdated" ? "clock" : "shield"} size={13} />
      {verificationLabels[status]}
    </span>
  );
}
