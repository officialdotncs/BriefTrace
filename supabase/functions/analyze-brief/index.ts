const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are BriefTrace, an academic assignment brief analyzer. Extract concrete requirements from a university assignment brief and return them as structured JSON.

RULES:
1. Extract each distinct requirement concisely. Preserve specific details verbatim — exact word counts, minimum source numbers, required section names, formatting rules, due dates, submission methods. Do NOT summarize or generalize. If the brief says "2,500 words" keep "2,500 words".
2. Each requirement MUST include a source_passage: the EXACT sentence or phrase from the original text. Copy it verbatim including punctuation. It will be matched against the original text — if it doesn't match, it will be marked unverified.
3. Do NOT duplicate requirements. Each distinct rule should appear once.
4. Keep requirement_text concise — state the requirement, do not explain or elaborate.
5. Categories (use exactly these):
   - "Deliverables": what the student must produce
   - "Grading Criteria": how the work will be assessed, rubric, weighting
   - "Word Count": length requirements, page limits
   - "References": source requirements, citation style, minimum sources
   - "Formatting": font, spacing, margins, title page, file format
   - "Submission Instructions": how/where to submit, deadlines, file naming
   - "Other": valid requirements that don't fit above
6. confidence: "explicit" if clearly stated, "needs_review" if implied, ambiguous, or uncertain.
7. If an expected category (submission instructions, word count) has NO matching content, add it to not_found with a note.
8. Do NOT invent requirements. Do NOT paraphrase source_passage. Do NOT include a deadline if none is stated.
9. Be concise. Return only the requirements array and not_found array. No explanations, no preamble, no markdown.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { brief } = await req.json();

    if (!brief || typeof brief !== "string" || brief.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "No brief text provided." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "AI analysis is not configured. The GEMINI_API_KEY secret is missing. Please add it in your project's Secrets settings.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const geminiBody = JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          parts: [{ text: brief }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingLevel: "low",
        },
      },
    });

    const upstreamTimeoutMs = 60000;
    const max503Retries = 1;
    let geminiResponse: Response | null = null;

    for (let attempt = 0; attempt <= max503Retries; attempt++) {
      const requestStart = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), upstreamTimeoutMs);
      try {
        geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: geminiBody,
          signal: controller.signal,
        });
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        const elapsed = Date.now() - requestStart;
        if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
          console.log(`Gemini request aborted by local timeout after ${elapsed}ms (attempt ${attempt + 1})`);
          return new Response(
            JSON.stringify({
              error: "The AI service took too long to respond. Please try again in a moment.",
            }),
            { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw fetchErr;
      }
      clearTimeout(timeoutId);

      const elapsed = Date.now() - requestStart;
      console.log(`Gemini responded with status ${geminiResponse.status} in ${elapsed}ms (attempt ${attempt + 1})`);

      if (geminiResponse.ok || geminiResponse.status !== 503) break;

      if (attempt < max503Retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!geminiResponse!.ok) {
      if (geminiResponse!.status === 503) {
        return new Response(
          JSON.stringify({
            error: "The AI service is temporarily unavailable. Please try again in a moment.",
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (geminiResponse!.status === 504) {
        return new Response(
          JSON.stringify({
            error: "The AI service took too long to respond on its end. Please try again in a moment.",
          }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorBody = await geminiResponse!.text();

      if (geminiResponse!.status === 429) {
        return new Response(
          JSON.stringify({
            error: "The free AI quota has been reached for now. Please try again later.",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          error: `The AI service returned an error (status ${geminiResponse!.status}). ${errorBody.slice(0, 200)}`,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse!.json();

    const extractedText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!extractedText) {
      return new Response(
        JSON.stringify({
          error: "The AI returned an empty response. Please try again.",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ raw_text: extractedText }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: `An unexpected error occurred: ${err.message || "Unknown error"}`,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
