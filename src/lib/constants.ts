import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  "Deliverables",
  "Grading Criteria",
  "Word Count",
  "References",
  "Formatting",
  "Submission Instructions",
  "Other",
];

export const VALID_CATEGORIES_LOWER = CATEGORIES.map((c) => c.toLowerCase());

export function normalizeCategory(raw: string): Category {
  const lower = raw.toLowerCase().trim();
  for (let i = 0; i < VALID_CATEGORIES_LOWER.length; i++) {
    if (VALID_CATEGORIES_LOWER[i] === lower) {
      return CATEGORIES[i];
    }
  }
  return "Other";
}

export const STATUS_CONFIG = {
  explicit: {
    label: "Explicit",
    color: "teal",
    badgeClass: "bg-teal/10 text-teal-dark border-teal/30",
    dotClass: "bg-teal",
  },
  needs_review: {
    label: "Needs review",
    color: "amber",
    badgeClass: "bg-amber/10 text-amber-dark border-amber/30",
    dotClass: "bg-amber",
  },
  not_found: {
    label: "Not found in supplied text",
    color: "neutral",
    badgeClass: "bg-neutral/10 text-neutral-dark border-neutral/30",
    dotClass: "bg-neutral",
  },
} as const;

export const MIN_BRIEF_LENGTH = 50;
