import type { AnalyzedRequirement } from "../types";
import { STATUS_CONFIG } from "../lib/constants";

interface RequirementCardProps {
  requirement: AnalyzedRequirement;
  isSelected: boolean;
  onClick: () => void;
  isMobile: boolean;
}

export function RequirementCard({
  requirement,
  isSelected,
  onClick,
  isMobile,
}: RequirementCardProps) {
  const tier =
    requirement.confidence === "explicit" && requirement.source_validated
      ? "explicit"
      : "needs_review";
  const config = STATUS_CONFIG[tier];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-4 transition-all duration-200 ${
        isSelected
          ? "border-teal bg-teal/5 shadow-sm"
          : "border-border bg-white hover:border-border-light hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm text-ink leading-relaxed">
          {requirement.requirement_text}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-dark font-medium">
          {requirement.category}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${config.badgeClass}`}
        >
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${config.dotClass}`}
            aria-hidden="true"
          />
          {config.label}
        </span>
        {tier === "needs_review" && requirement.source_validated === false && requirement.source_passage && (
          <span className="text-xs text-neutral">
            Source not verified
          </span>
        )}
        {!requirement.source_passage && (
          <span className="text-xs text-neutral">
            No source passage provided
          </span>
        )}
        {isMobile && requirement.source_passage && requirement.source_validated && (
          <span className="text-xs text-teal">Tap to view source</span>
        )}
      </div>
    </button>
  );
}
