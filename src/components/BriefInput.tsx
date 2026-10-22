import { useState } from "react";
import { MIN_BRIEF_LENGTH } from "../lib/constants";

interface BriefInputProps {
  onAnalyze: (brief: string) => void;
  isLoading: boolean;
}

export function BriefInput({ onAnalyze, isLoading }: BriefInputProps) {
  const [brief, setBrief] = useState("");

  const isEmpty = brief.trim().length === 0;
  const isShort = !isEmpty && brief.trim().length < MIN_BRIEF_LENGTH;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEmpty || isLoading) return;
    onAnalyze(brief);
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-navy mb-3 tracking-tight">
            BriefTrace
          </h1>
          <p className="text-neutral-dark text-sm leading-relaxed max-w-md mx-auto">
            Paste your assignment brief and get a verifiable requirements checklist.
            Every requirement links back to its exact source text — so you can check
            the AI's work yourself.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Paste your assignment brief here..."
              disabled={isLoading}
              className="w-full h-72 px-5 py-4 text-sm text-ink leading-relaxed resize-none focus:outline-none placeholder:text-neutral-light disabled:bg-cream-dark font-sans"
              aria-label="Assignment brief input"
            />
          </div>

          {isShort && !isLoading && (
            <p className="text-xs text-amber mt-2 ml-1">
              This looks short for an assignment brief. Make sure you've pasted the
              complete instructions.
            </p>
          )}

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={isEmpty || isLoading}
              className="px-8 py-3 bg-navy text-cream rounded-md text-sm font-medium transition-all duration-200 hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 focus:ring-offset-cream"
            >
              {isLoading ? "Analyzing your brief..." : "Analyze brief"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
