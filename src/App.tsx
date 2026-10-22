import { useState, useCallback } from "react";
import type { AppState, AnalysisResult, AnalyzedRequirement } from "./types";
import { BriefInput } from "./components/BriefInput";
import { ResultsView } from "./components/ResultsView";
import { ErrorState } from "./components/ErrorState";
import { validateAndTransform } from "./lib/validateSchema";
import { validateSourcePassage } from "./lib/validateSource";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-brief`;

export default function App() {
  const [appState, setAppState] = useState<AppState>("input");
  const [briefText, setBriefText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const callEdgeFunction = useCallback(async (brief: string): Promise<string> => {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ brief }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Request failed (${response.status}). Please try again.`
      );
    }

    const data = await response.json();

    if (!data.raw_text) {
      throw new Error("The AI returned an unexpected response format.");
    }

    return data.raw_text as string;
  }, []);

  const processAnalysis = useCallback(
    (rawText: string, originalBrief: string): AnalysisResult => {
      const validation = validateAndTransform(rawText);

      // Validate each source passage against the original text
      const validatedRequirements: AnalyzedRequirement[] =
        validation.requirements.map((req) => {
          const isValidated = validateSourcePassage(req.source_passage, originalBrief);
          return {
            ...req,
            source_validated: isValidated,
            // Downgrade to needs_review if source can't be validated
            confidence:
              req.confidence === "explicit" && !isValidated
                ? "needs_review"
                : req.confidence,
          };
        });

      return {
        requirements: validatedRequirements,
        notFoundCategories: validation.notFoundCategories,
      };
    },
    []
  );

  const handleAnalyze = useCallback(
    async (brief: string) => {
      setBriefText(brief);
      setAppState("loading");
      setErrorMessage("");

      try {
        const rawText = await callEdgeFunction(brief);
        let analysisResult: AnalysisResult;

        try {
          analysisResult = processAnalysis(rawText, brief);
        } catch (validationError) {
          // First attempt failed validation — retry once
          try {
            const retryRawText = await callEdgeFunction(brief);
            analysisResult = processAnalysis(retryRawText, brief);
          } catch (retryValidationError) {
            const msg =
              retryValidationError instanceof Error
                ? retryValidationError.message
                : "Unknown error";

            if (msg === "EMPTY_RESULTS") {
              setErrorMessage(
                "No requirements were found in this text. Make sure you've pasted a complete assignment brief and try again."
              );
            } else {
              setErrorMessage(
                "We couldn't process the AI's response after two attempts. Please check your text and try again."
              );
            }
            setAppState("error");
            return;
          }
        }

        setResult(analysisResult);
        setAppState("results");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An unknown error occurred.";
        setErrorMessage(msg);
        setAppState("error");
      }
    },
    [callEdgeFunction, processAnalysis]
  );

  const handleNewAnalysis = useCallback(() => {
    setResult(null);
    setErrorMessage("");
    setBriefText("");
    setAppState("input");
  }, []);

  const handleRetry = useCallback(() => {
    setErrorMessage("");
    setAppState("input");
  }, []);

  if (appState === "input" || appState === "loading") {
    return <BriefInput onAnalyze={handleAnalyze} isLoading={appState === "loading"} />;
  }

  if (appState === "error") {
    return <ErrorState message={errorMessage} onRetry={handleRetry} />;
  }

  if (appState === "results" && result) {
    return (
      <ResultsView
        result={result}
        originalText={briefText}
        onNewAnalysis={handleNewAnalysis}
      />
    );
  }

  return null;
}
