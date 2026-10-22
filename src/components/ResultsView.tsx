import { useState, useEffect } from "react";
import type { AnalysisResult, AnalyzedRequirement, NotFoundCategory } from "../types";
import { CATEGORIES, STATUS_CONFIG } from "../lib/constants";
import { RequirementCard } from "./RequirementCard";
import { SourcePane } from "./SourcePane";
import { StatusLegend } from "./StatusLegend";

interface ResultsViewProps {
  result: AnalysisResult;
  originalText: string;
  onNewAnalysis: () => void;
}

export function ResultsView({ result, originalText, onNewAnalysis }: ResultsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedMobileId, setExpandedMobileId] = useState<string | null>(null);

  const selectedRequirement =
    result.requirements.find((r) => r.id === selectedId) ?? null;

  // Group requirements by category
  const grouped = CATEGORIES.map((category) => ({
    category,
    items: result.requirements.filter((r) => r.category === category),
    notFound: result.notFoundCategories.find((nf) => nf.category === category),
  })).filter((g) => g.items.length > 0 || g.notFound);

  function handleCardClick(req: AnalyzedRequirement) {
    setSelectedId(req.id);
    setExpandedMobileId(expandedMobileId === req.id ? null : req.id);
  }

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-white">
        <h1 className="text-lg font-semibold text-navy tracking-tight">BriefTrace</h1>
        <button
          onClick={onNewAnalysis}
          className="px-4 py-2 text-sm text-navy border border-border rounded-md hover:bg-cream-dark transition-colors duration-200 font-medium"
        >
          New analysis
        </button>
      </header>

      {/* Legend */}
      <div className="px-6 py-2 border-b border-border bg-cream-dark/30">
        <StatusLegend />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          <div className="px-4 py-4 space-y-6 overflow-y-auto">
            {grouped.map((group) => (
              <CategorySection
                key={group.category}
                category={group.category}
                items={group.items}
                notFound={group.notFound}
                selectedId={selectedId}
                expandedMobileId={expandedMobileId}
                onCardClick={handleCardClick}
                originalText={originalText}
                isMobile={true}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full">
            {/* Left: checklist */}
            <div className="w-1/2 overflow-y-auto scrollbar-thin border-r border-border">
              <div className="px-5 py-4 space-y-6">
                {grouped.map((group) => (
                  <CategorySection
                    key={group.category}
                    category={group.category}
                    items={group.items}
                    notFound={group.notFound}
                    selectedId={selectedId}
                    expandedMobileId={expandedMobileId}
                    onCardClick={handleCardClick}
                    originalText={originalText}
                    isMobile={false}
                  />
                ))}
              </div>
            </div>

            {/* Right: source text */}
            <div className="w-1/2 bg-white">
              <SourcePane
                originalText={originalText}
                selectedRequirement={selectedRequirement}
                isMobile={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CategorySectionProps {
  category: string;
  items: AnalyzedRequirement[];
  notFound: NotFoundCategory | undefined;
  selectedId: string | null;
  expandedMobileId: string | null;
  onCardClick: (req: AnalyzedRequirement) => void;
  originalText: string;
  isMobile: boolean;
}

function CategorySection({
  category,
  items,
  notFound,
  selectedId,
  expandedMobileId,
  onCardClick,
  originalText,
  isMobile,
}: CategorySectionProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-navy mb-3 uppercase tracking-wide">
        {category}
      </h2>
      <div className="space-y-2.5">
        {items.map((req) => (
          <div key={req.id}>
            <RequirementCard
              requirement={req}
              isSelected={selectedId === req.id}
              onClick={() => onCardClick(req)}
              isMobile={isMobile}
            />
            {isMobile && expandedMobileId === req.id && req.source_passage && (
              <SourcePane
                originalText={originalText}
                selectedRequirement={req}
                isMobile={true}
              />
            )}
            {isMobile && expandedMobileId === req.id && !req.source_passage && (
              <div className="rounded-lg border border-border bg-white p-4 mt-2 text-xs text-neutral-dark">
                No source passage was provided for this requirement.
              </div>
            )}
          </div>
        ))}
        {notFound && items.length === 0 && (
          <div className="rounded-lg border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_CONFIG.not_found.badgeClass}`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_CONFIG.not_found.dotClass}`}
                  aria-hidden="true"
                />
                {STATUS_CONFIG.not_found.label}
              </span>
            </div>
            <p className="text-xs text-neutral-dark">{notFound.note}</p>
            <p className="text-xs text-neutral mt-1 italic">
              Note: absence from the supplied text does not prove absence from the
              complete assignment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
