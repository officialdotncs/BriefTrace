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

export const DEMO_BRIEF = `Assignment: Critical Review of Digital Learning

Write a 1,500–1,800 word critical review evaluating how digital learning tools affect university students. Include an introduction, a clearly structured argument, at least two counterarguments, and a conclusion.

Use at least six scholarly sources, with at least four published in the last five years. Cite and format references using APA 7th edition.

Use 12-point Times New Roman, double spacing, and 2.54 cm margins. Submit one PDF file through the university learning portal.

Your work will be assessed on strength of argument (30%), quality and use of evidence (30%), critical analysis (25%), and organization and formatting (15%).`;
