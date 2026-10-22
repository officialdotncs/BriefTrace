import { useRef, useMemo, useEffect } from "react";
import type { AnalyzedRequirement } from "../types";
import { findSourceRange } from "../lib/validateSource";

interface SourcePaneProps {
  originalText: string;
  selectedRequirement: AnalyzedRequirement | null;
  isMobile: boolean;
}

export function SourcePane({ originalText, selectedRequirement, isMobile }: SourcePaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);

  const segments = useMemo(() => {
    if (!selectedRequirement || !selectedRequirement.source_passage) {
      return [{ text: originalText, highlighted: false }];
    }

    const range = findSourceRange(selectedRequirement.source_passage, originalText);

    if (!range) {
      return [{ text: originalText, highlighted: false }];
    }

    return [
      { text: originalText.slice(0, range.start), highlighted: false },
      { text: originalText.slice(range.start, range.end), highlighted: true },
      { text: originalText.slice(range.end), highlighted: false },
    ].filter((s) => s.text.length > 0);
  }, [originalText, selectedRequirement]);

  useEffect(() => {
    if (selectedRequirement && highlightRef.current && containerRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedRequirement]);

  if (isMobile) {
    return (
      <div className="rounded-lg border border-border bg-white p-4 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-teal"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
          <h3 className="text-xs font-semibold text-navy uppercase tracking-wide">
            Source text
          </h3>
        </div>
        <div
          ref={containerRef}
          className="text-sm text-ink leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto scrollbar-thin"
        >
          {segments.map((seg, i) =>
            seg.highlighted ? (
              <span key={i} ref={highlightRef} className="source-highlight">
                {seg.text}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-cream-dark/50">
        <svg
          className="w-4 h-4 text-teal"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
        <h3 className="text-xs font-semibold text-navy uppercase tracking-wide">
          Original brief
        </h3>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 text-sm text-ink leading-relaxed whitespace-pre-wrap"
      >
        {selectedRequirement ? (
          segments.map((seg, i) =>
            seg.highlighted ? (
              <span key={i} ref={highlightRef} className="source-highlight">
                {seg.text}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )
        ) : (
          <span>{originalText}</span>
        )}
      </div>
    </div>
  );
}
