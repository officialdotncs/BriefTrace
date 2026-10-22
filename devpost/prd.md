---
doc: prd
status: approved
---

# BriefTrace — Product Requirements

One line: a tool that converts university assignment briefs into a verifiable requirements checklist, where every requirement links back to its source text and the app honestly flags what it couldn't find or isn't sure about.

Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

## The Core Journey

1. **Arrival.** The student opens BriefTrace and sees a clean, single-page interface. A text area occupies the center with a brief prompt: "Paste your assignment brief here." An "Analyze brief" button sits below the text area. Nothing else competes for attention.

2. **Input.** The student pastes a full assignment brief — three to five pages of text including deliverables, grading rubric, formatting rules, source requirements, and submission instructions — into the text area and clicks "Analyze brief."

3. **Processing.** The button shows a loading state. The app sends the text for AI analysis with a structured prompt requesting JSON output. The student sees a clear "Analyzing your brief..." indicator. If the AI response is malformed, the app retries once. If it still fails, the student sees a clear error message explaining the analysis didn't succeed and can try again.

4. **Results — split view.** The screen transitions to a two-column layout. The left column shows the requirements checklist, organized into categories. The right column shows the original pasted brief text. Each requirement appears as a card with: the requirement text (preserving specific details like word counts and source minimums), a category label, a confidence tier indicator (Explicit / Needs review / Not found), and a "View source" affordance.

5. **Traceability.** The student clicks a requirement card. The right column scrolls to the corresponding source passage and highlights it. The student can immediately compare the extracted requirement with the original text. If the passage was not validated against the original text, no highlight appears and the card shows a "Needs review" state instead — the app never fakes a citation.

6. **Uncertainty.** The student notices items marked "Needs review" (amber indicator) for ambiguous instructions and "Not found in supplied text" (grey indicator) for expected categories like deadline that had no matching content. These are visually distinct from "Explicit" (teal/green indicator) items. The student knows what to ask their instructor about.

7. **Re-analysis.** The student can paste a different brief or modify the current one and click "Analyze" again. The previous results are replaced. No history is kept.

Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`, `scope.md > The PoC Boundary`.

## Screens and Layout

BriefTrace is a single-page application with two states:

### Input State

- Centered text area for pasting the assignment brief
- "Analyze brief" button below the text area
- Brief instructional text: "Paste your assignment brief here"
- Minimal, focused layout — nothing else on screen
- On narrow screens: single column, text area fills available width

### Results State (Split View)

- **Left column (checklist):** Requirements organized by category. Each requirement is a card showing: requirement text, category label, confidence tier badge, and "View source" interaction. Categories include: Deliverables, Grading Criteria, Word Count, References, Formatting, Submission Instructions. Categories with no found content show a "Not found in supplied text" placeholder.
- **Right column (source text):** The full original pasted brief, displayed as readable text. When a requirement is clicked, this column scrolls to the matching passage and highlights it. The highlight is visually distinct (background color) and persists until another requirement is clicked.
- **Top bar:** App name "BriefTrace" and a "New analysis" button to return to the input state.

### Responsive Behavior

- **Desktop:** Two-column split view, checklist left, source text right, both visible simultaneously.
- **Tablet/mobile:** Stacked layout. Checklist on top. Tapping a requirement expands an inline source panel below that requirement card showing the passage and its surrounding context, highlighted. No cramped two-column forcing.

Source: `scope.md > The PoC Boundary`, learner PRD interview decisions.

## Look and Feel

**Palette — premium academic:**
- Primary: deep navy (#1a2744 or similar)
- Background: warm off-white (#faf8f3 or similar)
- Accent: restrained teal (#2c7d7b or similar)
- Borders: subtle neutral (#e2ddd0 or similar)
- Text: dark ink on warm off-white for body; navy for headings

**Status colors (used consistently, never alone):**
- Explicit: restrained teal/green
- Needs review: amber
- Not found in supplied text: neutral grey

**Typography:**
- Excellent readability as the top priority — this is a text-dense tool
- Clear hierarchy: large headings, comfortable body text, small labels
- Generous line spacing (150% body, 120% headings)
- Maximum 3 font weights
- Editorial feel — feels like a well-designed academic publication, not a chatbot

**Spacing and layout:**
- 8px spacing system
- Generous whitespace — cards have room to breathe
- Calm, not cramped

**Overall character:** Trustworthy academic productivity tool. Refined, editorial, reassuring. Not a generic AI chatbot, not a flashy analytics dashboard. Strong contrast throughout — text is always readable on every background.

Source: `scope.md > Inspiration & Identity`, learner PRD interview decisions.

## Features and Behavior

### Brief Input

The student pastes assignment text into a text area and clicks "Analyze brief."

- As a student, I want to paste my full assignment brief and get an organized breakdown so that I don't have to re-read it five times to find every requirement.
  - [ ] Text area accepts pasted plain text of any reasonable length (at least 5,000 characters)
  - [ ] "Analyze brief" button is disabled when the text area is empty
  - [ ] Clicking "Analyze brief" with content triggers the analysis flow

### AI Analysis

The app sends the pasted text to an AI model with a carefully designed prompt requesting structured JSON output: a list of requirements, each with a category, requirement text, source passage, and confidence flag.

- As a student, I want the app to extract every concrete requirement from my brief so that I don't miss anything important.
  - [ ] The AI prompt requests JSON with a defined schema: array of requirement objects, each with `category`, `requirement_text`, `source_passage`, `confidence` ("explicit" | "needs_review"), and `not_found_category` (for expected categories with no matching content)
  - [ ] The AI prompt enforces a controlled set of categories: Deliverables, Grading Criteria, Word Count, References, Formatting, Submission Instructions
  - [ ] The AI prompt instructs the model to preserve specific details (exact numbers, word counts, section names) rather than summarizing them away
  - [ ] The AI prompt instructs the model to flag ambiguous instructions as "needs_review" rather than guessing
  - [ ] The AI prompt instructs the model to report expected categories with no matching content as "not_found"

### Source Passage Validation

Before presenting a requirement as "Explicit," the app validates that the AI's claimed source passage actually exists in the pasted text. Validation uses exact string matching with whitespace normalization (collapsing multiple spaces, trimming, normalizing line breaks). Fuzzy matching alone does not qualify as verified.

- As a student, I want to trust that cited source passages are real so that the traceability feature is meaningful, not decorative.
  - [ ] Every requirement with confidence "explicit" has its `source_passage` validated against the original pasted text via exact match (after whitespace normalization)
  - [ ] If the source passage does not match exactly, the requirement is downgraded to "Needs review" regardless of the AI's claimed confidence
  - [ ] A validated passage is eligible for highlighting in the source view; an unvalidated passage is not highlighted
  - [ ] Validation runs client-side after the AI response is received

### Results Display — Split View

The results screen shows the checklist and the original brief side by side (desktop) or stacked (mobile).

- As a student, I want to see my requirements organized by category so that I can quickly understand what I'm responsible for.
  - [ ] Requirements are grouped under category headings: Deliverables, Grading Criteria, Word Count, References, Formatting, Submission Instructions
  - [ ] Each requirement card shows: requirement text, category label, confidence tier badge (with both color and text label)
  - [ ] Requirement text preserves specific details (exact word counts, minimum source numbers, required section names)
  - [ ] Categories with no found content show a "Not found in supplied text" placeholder with a grey indicator

### Traceability — Click to View Source

The student clicks a requirement card to see its source passage in the original brief.

- As a student, I want to click a requirement and immediately see where it came from in my brief so that I can verify the AI interpreted it correctly.
  - [ ] Clicking an "Explicit" requirement scrolls the source column to the matching passage and highlights it (distinct background color)
  - [ ] The highlight persists until another requirement is clicked
  - [ ] Clicking a "Needs review" requirement shows an explanation that the source passage could not be validated, without highlighting unrelated text
  - [ ] Clicking a "Not found" item shows an explanation that this information was not identified in the supplied text, with a note that absence from the supplied text does not prove absence from the complete assignment
  - [ ] On mobile, tapping a requirement expands an inline source panel below the card

### Confidence Tier Display

Three tiers are visually distinct, using both color and text labels (never color alone).

- As a student, I want to immediately see which requirements are solid and which need my attention so that I know what to follow up on.
  - [ ] "Explicit" items show a teal/green badge with the label "Explicit" — the source passage was validated
  - [ ] "Needs review" items show an amber badge with the label "Needs review" — the AI interpretation is plausible but ambiguous, or the source passage could not be validated
  - [ ] "Not found" items show a grey badge with the label "Not found in supplied text" — an expected category had no matching content
  - [ ] All three tiers are distinguishable without color (text labels are always present)
  - [ ] A brief legend explaining the three tiers is visible on the results screen

### Error Handling

When the AI response is malformed or the analysis fails, the app handles it transparently.

- As a student, I want to know when something went wrong rather than seeing fake results so that I can trust the tool.
  - [ ] If the AI response is not valid JSON, the app retries once with the same input
  - [ ] If the retry also fails, the app shows a clear error message: "We couldn't analyze this brief. Please check your text and try again."
  - [ ] If the AI response is valid JSON but missing required fields, the app attempts to salvage valid requirements and marks incomplete ones as "Needs review"; if no requirements can be salvaged, it shows the error message
  - [ ] If the AI response contains invalid category names, those requirements are either mapped to the closest valid category or marked "Needs review"
  - [ ] The app never displays fabricated results or sample data when a real analysis fails
  - [ ] The error state includes a "Try again" button that returns to the input state with the pasted text preserved

### New Analysis

The student can start over with a different brief.

- As a student, I want to analyze a different brief so that I can use the tool for my next assignment.
  - [ ] A "New analysis" button in the top bar returns to the input state
  - [ ] The previous results and source text are cleared
  - [ ] The text area is empty for the new paste

Source: `scope.md > The PoC Boundary`, `scope.md > Main Risks`, `scope.md > Acceptance Criteria`.

## States and Boundaries

- **First use / input state:** Clean text area, "Analyze brief" button, brief instructional prompt. Nothing else. No accounts, no onboarding.
- **Loading state:** Button is disabled, "Analyzing your brief..." indicator visible. No intermediate results shown.
- **Results state:** Split view with checklist and source text. Both columns are scrollable independently.
- **Error state:** Clear error message, "Try again" button, pasted text preserved. No fabricated results.
- **Empty results:** If the AI returns zero requirements (valid JSON, empty array), the app shows: "No requirements were found in this text. Make sure you've pasted a complete assignment brief and try again."
- **Persistence:** Nothing persists between sessions. No accounts, no history, no saved briefs. Refreshing the page returns to the input state.
- **Boundaries:** The app analyzes one brief at a time. It does not write assignments, generate essays, predict grades, detect plagiarism, search the web, or integrate with any external system. It reads pasted text, extracts requirements, validates sources, and displays results.

Source: `scope.md > The PoC Boundary`, `scope.md > Explicitly Cut`.

## Product Decisions

- **Split view for results** — learner chose split view over overlay/popup because it makes the connection between requirement and source immediately visible, which is the defining feature of the product and the most important demo moment.
- **Responsive stacking on mobile** — learner specified expandable inline panels on narrow screens rather than cramped two-column layout.
- **Premium academic palette** — learner chose deep navy, warm off-white, restrained teal accents, subtle neutral borders. Refined editorial feel. Trustworthy, not flashy.
- **Status colors with text labels** — learner specified teal/green for Explicit, amber for Needs review, grey for Not found. Explicitly required that color is never the sole indicator — text labels always accompany color.
- **Exact match for source validation** — learner decided that only exact string matching (with whitespace normalization) qualifies a passage as "Explicit." Fuzzy matching alone must not be presented as verified evidence. This is the core safeguard.
- **Controlled retry on malformed AI responses** — learner specified at most one retry, then a clear error. Never fabricate results or substitute sample data.
- **No persistence** — learner confirmed no accounts, no history, no saved briefs for the PoC. Single-session, one brief at a time.
- **Controlled category set** — learner specified six fixed categories: Deliverables, Grading Criteria, Word Count, References, Formatting, Submission Instructions. The AI must use these, not invent its own.

Source: learner PRD interview decisions, `scope.md > The PoC Boundary`.

## What We're Building

1. Paste-text input with "Analyze brief" button
2. AI analysis with structured JSON prompt and controlled schema
3. Source passage validation (exact match with whitespace normalization)
4. Split-view results: categorized checklist (left) + original brief text (right)
5. Click-to-view-source with scroll and highlight
6. Three-tier confidence display (Explicit / Needs review / Not found) with color + text labels
7. Graceful error handling with controlled retry and transparent failure
8. Responsive layout (split on desktop, stacked with inline source panels on mobile)
9. "New analysis" flow to reset and start over
10. Premium academic visual design: navy, warm off-white, teal accents, editorial typography

## Deferred From the POC

- **PDF/image upload and OCR**: adds input pipeline complexity. Pasted text is sufficient to prove the concept.
- **Accounts and authentication**: no persistence needed for a single-session proof.
- **Assignment history and saved results**: one brief at a time is enough to prove the concept.
- **Chatbot interface**: the value is structured results, not conversation.
- **Calendar/reminders/LMS integrations**: external dependencies that don't serve the core proof.
- **Assignment writing, essay generation, plagiarism detection, grade prediction, research tools**: adjacent problems outside the product's purpose.

## Possible Later Enhancements

- PDF and image upload with OCR for students who receive briefs as files rather than text.
- Assignment history so students can revisit previous analyses without re-pasting.
- Account system enabling saved briefs and cross-device access.
- Export checklist as PDF or printable format for offline reference.
- Sharing a checklist with a study group or instructor for clarification.

## Non-Goals

- **No assignment writing or essay generation** — the product supports understanding requirements, not doing the work. Including this would undermine the academic responsibility positioning.
- **No conversational chatbot** — the learner explicitly does not want a generic AI chat. Value is in structured results.
- **No plagiarism detection or grade prediction** — adjacent problems that would expand scope without strengthening the kernel.
- **No web-based research or external API integrations** — the app reads pasted text and extracts requirements. It does not fetch external content.
- **No persistence between sessions** — no accounts, no history, no saved briefs. Refreshing returns to a clean input state.
- **No fabricated results or sample data fallback** — if live analysis fails, the app says so. It never pretends a failed analysis succeeded.

Source: `scope.md > Explicitly Cut`, `scope.md > Later`.

## Open Questions

- **AI model selection and API setup**: which AI model to use and how to configure it in Bolt is a technical decision for `4-spec`. Does not block PRD approval.
- **Test briefs**: two realistic test briefs (one complete, one with missing/ambiguous info) need to be created for build verification. This is a build-phase concern, not a product decision.
