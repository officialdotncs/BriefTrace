---
doc: scope
status: approved
---

# BriefTrace

One line: a tool that converts university assignment briefs into a verifiable requirements checklist, where every requirement links back to its source text and the app honestly flags what it couldn't find or isn't sure about.

## The Unique Kernel

Traceability plus honest uncertainty. Every extracted requirement points to the exact passage it came from in the original brief, and the app validates that the passage actually exists before presenting it as evidence. When something is ambiguous, contradictory, or missing, the app says so — it never invents answers or dresses up a guess as a fact. That combination is what makes this not just another AI summarizer: the student can verify the AI's work, and the system makes its own limitations visible.

## Who It's For

A first- or second-year undergraduate student who understands their subject but struggles to turn a dense three-to-five-page assignment brief into a clear plan. The information is all there — deliverables, grading rubric, formatting rules, minimum source counts, submission instructions — but it's scattered across the document. They worry about overlooking a small requirement that could cost them marks. Today they re-read the brief multiple times and still feel unsure about what the professor actually expects.

## The Core Loop

The student opens the app, pastes an assignment brief into a text area, and clicks "Analyze." BriefTrace returns a structured checklist organized into categories — deliverables, grading criteria, word count, references, formatting, submission instructions. Each requirement preserves specific details (exact word counts, minimum source numbers, required sections) rather than collapsing them into vague summaries. The student clicks any requirement to see the exact source sentence from the original brief, highlighted in context. Items that are ambiguous, contradictory, or not found in the supplied text are visibly marked so the student knows what to ask their instructor about.

## Inspiration & Identity

Clean, premium interface with strong typography, generous spacing, and intuitive interactions. Focused and reassuring — not cluttered with charts, chat windows, or unnecessary buttons. The feeling should be: a confusing assignment just became a manageable plan, and I can check the AI's work myself. No design references cited yet; the learner prefers a professional, well-structured aesthetic that feels like a real product.

## Why This Matters to the Learner

"I want to build something that genuinely helps people rather than another generic AI chatbot." The learner wants to demonstrate that AI can support academic responsibility — helping students understand what they're responsible for completing — rather than encouraging blind trust or doing the work for them. This is also a learning exercise in plan-first, spec-driven development.

## What "Working" Looks Like

A student pastes a realistic undergraduate assignment brief (with grading criteria, specific constraints, and at least one ambiguous or missing detail) into BriefTrace and clicks "Analyze." Within a few seconds, the screen shows an organized checklist of requirements grouped by category. The student clicks "View source" on a requirement like "Use at least eight academic sources" and sees the exact sentence from the original brief, highlighted. They notice a "Needs review" flag on an ambiguous instruction and a "Not found" note where the deadline should be — both clearly distinguished from verified requirements. The student can compare each requirement with its source and knows what to clarify with their instructor.

The "oh, that's cool" moment: clicking a checklist item and seeing the exact source sentence appear, proving the AI's interpretation is checkable rather than a black box.

## The PoC Boundary

**In scope:**
- Paste-text input (no file uploads)
- Single analysis: one brief at a time, no history
- AI analysis returning structured JSON with a controlled set of requirement categories
- Source passage validation: exact match (with whitespace normalization) against the pasted text before presenting as verified
- Three-tier confidence display:
  - **Explicit**: source passage validated against original text
  - **Needs review**: AI interpretation is plausible but ambiguous, or source passage cannot be validated
  - **Not found**: a expected category (e.g., deadline) had no matching content in the supplied text
- Click-to-view-source interaction showing the original passage in context
- Graceful error handling: malformed AI responses get at most one controlled retry, then a clear error message — never fabricated results or sample data
- Clean, premium UI with strong typography and organized results

## Later

- PDF and image uploads, OCR, external document imports
- Multiple-assignment dashboards and saved assignment history
- User accounts and authentication
- Calendar integration and automatic reminders
- Learning management system integrations
- Collaboration features
- Assignment writing, essay generation, plagiarism detection, grade prediction, web-based research
- Conversational chatbot interface
- Advanced analytics and complex settings

## Explicitly Cut

- **PDF/image upload and OCR**: adds complexity to the input pipeline that doesn't serve the core proof. Pasted text is sufficient to demonstrate traceability and uncertainty.
- **Accounts and authentication**: no persistence needed for a single-session proof of concept. Adds infrastructure without improving the core experience.
- **Assignment history and saved results**: same reasoning — one brief at a time is enough to prove the concept.
- **Chatbot interface**: the learner explicitly does not want a generic AI chat. The value is structured results, not conversation.
- **Assignment writing and essay generation**: the product supports understanding requirements, not doing the work. Including this would undermine the academic responsibility positioning.
- **Calendar/reminders/LMS integrations**: external dependencies that don't improve the core proof and add implementation risk.
- **Plagiarism detection, grade prediction, research tools**: adjacent problems that would expand scope without strengthening the kernel.

## Main Risks

1. **AI response format instability.** The entire concept depends on the AI returning structured JSON with a consistent schema. If the AI returns prose, omits source passages, or invents category names, parsing breaks. Mitigation: carefully designed prompt, strict schema validation, controlled retry, and transparent error handling.
2. **Source passage matching edge cases.** Exact text matching with whitespace normalization should work for most cases, but paraphrased or partially quoted passages won't validate. This is acceptable for PoC — unvalidated passages are marked "Needs review" rather than presented as verified.
3. **AI extraction quality.** The AI may miss requirements, invent requirements, or misinterpret constraints. Mitigation: traceability lets the student catch errors, and the confidence tiers make limitations visible rather than hidden.

## Acceptance Criteria

- A student can paste a realistic assignment brief and receive a structured, categorized checklist
- Each requirement preserves specific details (word counts, source minimums, required sections) rather than vague summaries
- Clicking a requirement shows the exact source passage from the original brief, highlighted in context
- Source passages are validated against the pasted text before being labeled "Explicit"
- Unvalidated or ambiguous items are visibly marked as "Needs review"
- Missing information (e.g., no deadline found) is shown as "Not found in supplied text"
- Malformed AI responses trigger a clear error, not fabricated results
- The workflow works end-to-end on at least two realistic test briefs, including one with missing or ambiguous information
