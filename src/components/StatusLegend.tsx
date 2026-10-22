import type { ConfidenceTier } from "../types";
import { STATUS_CONFIG } from "../lib/constants";

export function StatusLegend() {
  const tiers: ConfidenceTier[] = ["explicit", "needs_review", "not_found"];

  return (
    <div className="flex flex-wrap gap-4 items-center text-xs text-neutral-dark">
      {tiers.map((tier) => {
        const config = STATUS_CONFIG[tier];
        return (
          <div key={tier} className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${config.dotClass}`}
              aria-hidden="true"
            />
            <span>{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}
