---
doc: spec
status: approved
---

# BriefTrace — Technical Spec

## How This Works, In Plain Language

The student pastes their assignment brief into a web page. When they click "Analyze," the text is sent to a small server-side function (a Supabase Edge Function) that forwards it to an AI model (Google Gemini) with a carefully written prompt. The prompt tells the AI to extract requirements and return them as structured data — not prose — with each requirement including the exact sentence it came from. The AI's API key lives on the server, never in the browser.

The server function sends the AI's response back to the web page. The web page then checks each claimed source passage against the original pasted text using exact string matching. If the passage really exists in the text, the requirement is labeled "Explicit." If it doesn't match, the requirement is downgraded to "Needs review." Requirements the AI flagged as ambiguous are also "Needs review." Expected categories with no matching content are "Not found in supplied text."

The results appear in a split view: checklist on the left, original brief on the right. Clicking a requirement scrolls to and highlights its source passage. Nothing is saved — refreshing the page starts fresh.

## The Core Journey Through the System

1. Student pastes brief into text area → clicks "Analyze brief"
2. Frontend sends POST request to Supabase Edge Function `analyze-brief` with `{ brief: string }`
3. Edge function calls Google Gemini API with a structured prompt requesting JSON output
4. Gemini returns JSON: array of requirement objects + not_found categories
5. Edge function returns the JSON to the frontend
6. Frontend validates JSON schema (required fields, valid categories)
7. Frontend validates each source_passage against original text (exact match, whitespace-normalized)
8. Frontend groups requirements by category, assigns confidence tiers
9. Frontend renders split view: checklist (left) + original brief (right)
10. Student clicks a requirement → right column scrolls to passage and highlights it

PRD ref: `prd.md > The Core Journey`.

## Stack

- **React + TypeScript + Vite** — Bolt's standard frontend stack. No alternative considered; this is the established project stack.
- **Tailwind CSS** — utility-first styling for the premium academic design. Standard in Bolt projects.
- **Supabase Edge Function (Deno)** — server-side function to call Google Gemini while keeping the API key secret. Bolt's documented pattern for external AI API calls.
- **Google Gemini Developer API (gemini-3.8-flash)** — free-tier model, capable enough for structured extraction. Doc: https://ai.google.dev/gemini-api/docs/text-generation
- **No database tables** — no persistence needed. Single-session, one brief at a time.
- **No authentication** — no accounts, no login.

## Where It Runs and How Someone Tries It

- **Runtime:** Browser (Vite dev server). The edge function runs on Supabase's hosted infrastructure.
- **Environment requirements:** A `GEMINI_API_KEY` secret must be added via Bolt's Secrets settings (database icon → Secrets) for the edge function to call Google Gemini.
- **Start command:** `npm run dev` — opens the app in the browser at localhost.
- **Demo recording:** Paste a realistic assignment brief, click "Analyze brief," show the split-view results, click requirements to see highlighted source passages, point out "Needs review" and "Not found" items. Record screen for ~60 seconds.
- **Submission:** Short demo video + public GitHub repository. Deployment is optional.

## Look and Feel

PRD ref: `prd.md > Look and Feel`.

- **Palette:** Deep navy (#1a2744) for headings and primary elements. Warm off-white (#faf8f3) for backgrounds. Restrained teal (#2c7d7b) for accents and "Explicit" status. Amber (#b45309) for "Needs review." Neutral grey (#6b7280) for "Not found." Subtle neutral borders (#e2ddd0). Dark ink text (#1c1c1c) on warm off-white.
- **Typography:** System font stack or a clean sans-serif (Inter if available). Large headings, comfortable body text, small labels. 150% line height for body, 120% for headings. Max 3 weights (regular, medium, bold).
- **Density:** Spacious and calm. 8px spacing system. Cards have generous padding. Clear visual hierarchy.
- **Tone:** Trustworthy academic productivity tool. Refined editorial feel. Not a chatbot, not a dashboard.

## Components

### App (main page)

Single-page application with two states managed by React state: `input` and `results`. No router needed — state determines what's rendered.

PRD ref: `prd.md > Screens and Layout`.

### BriefInput

Text area + "Analyze brief" button. Disabled button when empty. Loading state during analysis. Calls the edge function and passes results up to App.

PRD ref: `prd.md > Brief Input`.

### ResultsView (Split View)

Two-column layout on desktop (checklist left, source text right). Stacked on mobile with inline expandable source panels. Top bar with "BriefTrace" title and "New analysis" button.

PRD ref: `prd.md > Results Display — Split View`, `prd.md > Traceability — Click to View Source`.

### RequirementCard

Individual requirement display. Shows requirement text, category label, confidence tier badge (color + text label). Clickable to trigger source highlighting. On mobile, expands an inline source panel.

PRD ref: `prd.md > Results Display — Split View`, `prd.md > Confidence Tier Display`.

### SourcePane

Right column. Renders the original pasted brief as readable text. Scrolls to and highlights the selected requirement's source passage. Highlight is a distinct background color that persists until another requirement is clicked.

PRD ref: `prd.md > Traceability — Click to View Source`.

### ErrorState

Clear error message + "Try again" button. Preserves pasted text. Shown when AI analysis fails after retry.

PRD ref: `prd.md > Error Handling`.

### analyze-brief (Edge Function)

Supabase Edge Function (Deno). Receives `{ brief: string }`, calls Google Gemini Developer API with a structured prompt requesting JSON output, returns the AI's JSON response. Includes CORS headers. Handles Gemini API errors and rate limits gracefully.

PRD ref: `prd.md > AI Analysis`.

### Source Validation (utility)

Client-side function. Takes a source passage and the original text. Normalizes whitespace in both (collapse multiple spaces, trim, normalize line breaks). Returns true if the normalized passage is found in the normalized original text. Used to determine "Explicit" vs "Needs review."

PRD ref: `prd.md > Source Passage Validation`.

### JSON Schema Validation (utility)

Client-side function. Validates the AI response structure: checks for valid JSON, required fields per requirement object, valid category names, valid confidence values. Returns validated requirements + any salvaged partial results.

PRD ref: `prd.md > Error Handling`.

## Data Model

No database. All data lives in React state during a single session:

- `briefText: string` — the pasted assignment brief
- `analysisResult: AnalyzedRequirement[]` — validated requirements with confidence tiers
- `notFoundCategories: string[]` — expected categories with no matching content
- `appState: "input" | "loading" | "results" | "error"` — current view state
- `selectedRequirementId: string | null` — which requirement is currently highlighted

**AnalyzedRequirement shape:**
```typescript
{
  id: string;              // generated client-side
  category: string;        // one of 7 controlled categories
  requirement_text: string; // preserves specific details
  source_passage: string;   // claimed source from AI
  confidence: "explicit" | "needs_review";
  source_validated: boolean; // result of exact match check
}
```

**Controlled categories:** Deliverables, Grading Criteria, Word Count, References, Formatting, Submission Instructions, Other.

Nothing persists. Refreshing clears everything.

## File Structure

```
project/
├── src/
│   ├── App.tsx                    # Main app, state management
│   ├── main.tsx                   # Vite entry point
│   ├── index.css                  # Global styles, Tailwind
│   ├── components/
│   │   ├── BriefInput.tsx         # Input text area + analyze button
│   │   ├── ResultsView.tsx        # Split view container
│   │   ├── RequirementCard.tsx    # Individual requirement card
│   │   ├── SourcePane.tsx         # Right column source text display
│   │   ├── ErrorState.tsx         # Error message + retry
│   │   └── StatusLegend.tsx       # Confidence tier legend
│   ├── lib/
│   │   ├── validateSource.ts      # Source passage exact match validation
│   │   ├── validateSchema.ts      # AI JSON response schema validation
│   │   └── constants.ts           # Categories, status colors, config
│   └── types.ts                   # TypeScript types
├── supabase/
│   ├── config.toml                # Supabase config with edge function table
│   └── functions/
│       └── analyze-brief/
│           └── index.ts           # Edge function: calls Google Gemini
├── devpost/                       # Planning documents
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## External Services and Dependencies

### Google Gemini Developer API

- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent`
- **Model:** `gemini-3.8-flash` (free tier)
- **Auth:** API key as query parameter (`?key=GEMINI_API_KEY`) or `x-goog-api-key` header
- **Request:** System instruction + user content containing the brief, with `responseMimeType: "application/json"` for structured output
- **Response:** JSON with `candidates[0].content.parts[0].text` containing the JSON string
- **Doc:** https://ai.google.dev/gemini-api/docs/text-generation
- **Cost:** Free tier available (rate-limited). No billing account required.
- **Rate limits:** Free tier has per-minute and per-day request limits. If exhausted, edge function returns a clear error.
- **Required credential:** `GEMINI_API_KEY` — must be added via Bolt Secrets settings. If missing, edge function returns a clear error.

### Supabase Edge Functions

- Used only to host the `analyze-brief` function. No database tables, no auth, no storage.
- Doc: https://supabase.com/docs/guides/functions

## Important Failure Modes

- **Missing GEMINI_API_KEY secret** → Edge function returns HTTP 500 with a clear message. Frontend shows error state: "AI analysis isn't configured yet. An API key is required. Please add the GEMINI_API_KEY secret in your project's Secrets settings."
- **Free-tier quota exhausted** → Gemini API returns HTTP 429. Edge function returns a clear message. Frontend shows: "The free AI quota has been reached for now. Please try again later."
- **Malformed AI JSON response** → Frontend retries once. If retry also fails, shows error state with "Try again" button. Never fabricates results.
- **AI returns valid JSON but missing fields** → Salvage valid requirements, mark incomplete ones as "Needs review." If none salvageable, show error.
- **AI returns invalid category names** → Map to "Other" category or mark as "Needs review."
- **Empty brief or very short text** → "Analyze brief" button disabled for empty. For very short text (under ~50 characters), show a gentle warning: "This looks short for an assignment brief. Make sure you've pasted the complete instructions."
- **Network error calling edge function** → Show error state with "Try again" button.

## What Was Simplified and Why

- **No database persistence** instead of saving analysis history — the PoC is one brief at a time. Adding tables and history would add infrastructure without proving the kernel.
- **No authentication** instead of user accounts — no persistence means no accounts needed.
- **gemini-3.8-flash** instead of a larger model — sufficient for structured extraction on the free tier. The validation layer catches errors regardless of model size.
- **Client-side source validation** instead of server-side — the original text is already in the browser, so matching is a simple string operation. No need to send it back to the server.
- **"Other" category added** to the original six — real briefs contain requirements that don't fit neatly into the six predefined categories. Without "Other," the AI would either force-fit or drop them.

## Decisions and Open Issues

- **Google Gemini as AI provider** — chosen for its free-tier availability (no billing account required). The learner will need to add a `GEMINI_API_KEY` secret. This is the exact blocker to flag: without the key, the app cannot perform analysis and will show an honest error.
- **gemini-3.8-flash** — chosen for free-tier access and structured JSON output capability. Tradeoff: free-tier rate limits may restrict testing volume. Mitigated by honest rate-limit error handling.
- **"Other" category** — added per learner's instruction to handle valid requirements that don't fit the original six categories.
- **No Supabase database tables** — the product requires no persistence. Supabase is used only for edge function hosting.
- **Open issue: AI prompt quality** — the system prompt design is the most fragile piece. It must reliably produce valid JSON with the correct schema. This will be tested early in the build with realistic briefs and refined if needed.
- **Open issue: test briefs** — two realistic test briefs (one complete, one with missing/ambiguous info) must be created during the build phase for verification.
