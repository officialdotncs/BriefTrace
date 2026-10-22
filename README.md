# BriefTrace

A tool that converts university assignment briefs into a verifiable requirements checklist. Every extracted requirement links back to its exact source text, and the app honestly flags what it couldn't find or isn't sure about.

## How It Works

1. Paste an assignment brief into the text area and click "Analyze brief"
2. The app sends the text to a Supabase Edge Function, which calls Google Gemini to extract requirements as structured JSON
3. Each claimed source passage is validated against the original text using exact string matching
4. Results appear in a split view: categorized checklist (left) and original brief (right)
5. Click any requirement to scroll to and highlight its source passage
6. Requirements are labeled Explicit (verified), Needs review (ambiguous or unverified), or Not found in supplied text

## Running the Project

```bash
npm install
npm run dev
```

This starts the Vite dev server. The app runs in the browser at localhost.

To create a production build:

```bash
npm run build
```

## Configuring the Gemini API Key

The app uses Google Gemini's free-tier API for AI analysis. The API key is stored as a Supabase Edge Function secret — it never appears in frontend code.

1. Get a free Gemini API key at https://aistudio.google.com/apikey
2. In your Bolt project, click the **database icon** at the top center
3. Click **Secrets**
4. Add a secret named `GEMINI_API_KEY` with your key as the value

Without this key, the app will show a clear error message explaining that AI analysis is not configured. It will never fabricate results.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase Edge Functions (Deno)
- Google Gemini Developer API (gemini-3.8-flash, free tier)

## Project Structure

```
src/
├── App.tsx                  # Main app, state management
├── components/
│   ├── BriefInput.tsx       # Input text area + analyze button
│   ├── ResultsView.tsx      # Split view container
│   ├── RequirementCard.tsx  # Individual requirement card
│   ├── SourcePane.tsx       # Source text display with highlighting
│   ├── ErrorState.tsx       # Error message + retry
│   └── StatusLegend.tsx     # Confidence tier legend
├── lib/
│   ├── validateSource.ts    # Source passage exact match validation
│   ├── validateSchema.ts    # AI JSON response schema validation
│   └── constants.ts         # Categories, status colors, config
└── types.ts                 # TypeScript types

supabase/
└── functions/
    └── analyze-brief/
        └── index.ts         # Edge function: calls Gemini API
```
