import type {
  GeminiResponse,
  GeminiRequirement,
  AnalyzedRequirement,
  NotFoundCategory,
  Category,
} from "../types";
import { normalizeCategory } from "./constants";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

interface ValidationResult {
  requirements: AnalyzedRequirement[];
  notFoundCategories: NotFoundCategory[];
  partial: boolean;
}

/**
 * Validates and transforms the AI response into the app's internal format.
 * - Checks for valid JSON
 * - Validates required fields on each requirement
 * - Normalizes categories to the controlled set
 * - Salvages valid requirements, marks incomplete ones as needs_review
 */
export function validateAndTransform(rawText: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("INVALID_JSON");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("INVALID_SCHEMA");
  }

  const data = parsed as Partial<GeminiResponse>;
  const requirements: AnalyzedRequirement[] = [];
  const notFoundCategories: NotFoundCategory[] = [];
  let partial = false;

  // Process requirements array
  if (Array.isArray(data.requirements)) {
    for (const raw of data.requirements) {
      if (!isValidRequirement(raw)) {
        partial = true;
        continue;
      }

      const req = raw as GeminiRequirement;
      const category: Category = normalizeCategory(req.category);

      requirements.push({
        id: generateId(),
        category,
        requirement_text: req.requirement_text.trim(),
        source_passage: (req.source_passage || "").trim(),
        confidence: req.confidence === "explicit" ? "explicit" : "needs_review",
        source_validated: false, // Will be set by the caller after source validation
      });
    }
  }

  // Process not_found array
  if (Array.isArray(data.not_found)) {
    for (const nf of data.not_found) {
      if (nf && typeof nf === "object" && typeof nf.category === "string") {
        notFoundCategories.push({
          category: normalizeCategory(nf.category),
          note: typeof nf.note === "string" ? nf.note : "Not found in supplied text.",
        });
      }
    }
  }

  if (requirements.length === 0 && notFoundCategories.length === 0) {
    throw new Error("EMPTY_RESULTS");
  }

  return { requirements, notFoundCategories, partial };
}

function isValidRequirement(obj: unknown): obj is GeminiRequirement {
  if (typeof obj !== "object" || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.requirement_text === "string" &&
    r.requirement_text.trim().length > 0 &&
    typeof r.category === "string" &&
    (r.confidence === "explicit" || r.confidence === "needs_review")
  );
}
