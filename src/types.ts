export type ConfidenceTier = "explicit" | "needs_review" | "not_found";

export type Category =
  | "Deliverables"
  | "Grading Criteria"
  | "Word Count"
  | "References"
  | "Formatting"
  | "Submission Instructions"
  | "Other";

export interface AnalyzedRequirement {
  id: string;
  category: Category;
  requirement_text: string;
  source_passage: string;
  confidence: "explicit" | "needs_review";
  source_validated: boolean;
}

export interface NotFoundCategory {
  category: Category;
  note: string;
}

export interface AnalysisResult {
  requirements: AnalyzedRequirement[];
  notFoundCategories: NotFoundCategory[];
}

export type AppState = "input" | "loading" | "results" | "error";

export interface GeminiRequirement {
  category: string;
  requirement_text: string;
  source_passage: string;
  confidence: "explicit" | "needs_review";
}

export interface GeminiResponse {
  requirements: GeminiRequirement[];
  not_found: { category: string; note: string }[];
}
