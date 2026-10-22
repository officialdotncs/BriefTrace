/**
 * Normalizes whitespace: collapses multiple spaces/newlines into single spaces and trims.
 */
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Validates that a source passage exists in the original text using exact matching
 * with whitespace normalization. Returns true only if the normalized passage is
 * found as a substring of the normalized original text.
 */
export function validateSourcePassage(passage: string, originalText: string): boolean {
  if (!passage || !originalText) return false;
  const normalizedPassage = normalizeWhitespace(passage);
  const normalizedOriginal = normalizeWhitespace(originalText);
  if (normalizedPassage.length === 0) return false;
  return normalizedOriginal.includes(normalizedPassage);
}

/**
 * Finds the character offset range of the source passage within the original text.
 * Returns null if the passage cannot be found.
 *
 * Strategy: build a mapping array from normalized indices to original indices by
 * walking through the original text. Each non-whitespace character gets a normalized
 * index. Between non-whitespace characters, any run of whitespace in the original
 * maps to a single space in the normalized version. We use this to find the start
 * and end positions in the original text that correspond to the matched range in
 * the normalized text.
 */
export function findSourceRange(
  passage: string,
  originalText: string
): { start: number; end: number } | null {
  if (!passage || !originalText) return null;

  const normPassage = normalizeWhitespace(passage);
  const normOriginal = normalizeWhitespace(originalText);
  if (normPassage.length === 0) return null;

  const matchIdx = normOriginal.indexOf(normPassage);
  if (matchIdx === -1) return null;

  const matchEnd = matchIdx + normPassage.length; // exclusive end in normalized space

  // Build a map: for each index in normalized text, what is the corresponding
  // start position in the original text?
  // normalized[i] corresponds to originalText[origStartForNorm[i]]
  // For space characters in normalized text, the original may have a run of whitespace.
  const origStartForNorm: number[] = new Array(normOriginal.length);
  const origEndForNorm: number[] = new Array(normOriginal.length);

  let origPos = 0;
  for (let normIdx = 0; normIdx < normOriginal.length; normIdx++) {
    const normChar = normOriginal[normIdx];

    if (normChar === " ") {
      // Skip whitespace in original to find the start of this normalized space
      while (origPos < originalText.length && /\s/.test(originalText[origPos])) {
        origPos++;
      }
      origStartForNorm[normIdx] = origPos;
      // The space in normalized maps back to the whitespace before origPos
      // Actually, let's set start to the beginning of the whitespace run
      // We need to track where the whitespace run started
      // Let's use a simpler approach: origStartForNorm points to where this
      // normalized char starts in the original. For a space, it's the start
      // of the whitespace run. For a non-space, it's the position of that char.
    } else {
      // Non-whitespace: skip any whitespace before this char in original
      while (origPos < originalText.length && /\s/.test(originalText[origPos])) {
        origPos++;
      }
      origStartForNorm[normIdx] = origPos;
      origEndForNorm[normIdx] = origPos + 1;
      origPos++;
    }
  }

  // For the start: the match starts at normOriginal[matchIdx].
  // If matchIdx points to a non-space char, the start is origStartForNorm[matchIdx].
  // If matchIdx points to a space, we need the position of the first non-space
  // char at or after matchIdx that's within the match range.
  let startOrig: number;
  if (normOriginal[matchIdx] === " ") {
    // The match starts with a space — find the first non-space after it
    let ni = matchIdx;
    while (ni < matchEnd && normOriginal[ni] === " ") ni++;
    if (ni >= matchEnd) return null; // entire match is spaces
    startOrig = origStartForNorm[ni];
  } else {
    startOrig = origStartForNorm[matchIdx];
  }

  // For the end: the match ends at normOriginal[matchEnd - 1] (inclusive).
  // If it's a non-space, end is origEndForNorm[matchEnd - 1].
  // If it's a space, extend to include trailing whitespace in original.
  let endOrig: number;
  if (normOriginal[matchEnd - 1] === " ") {
    // Find the last non-space char before matchEnd
    let ni = matchEnd - 1;
    while (ni >= matchIdx && normOriginal[ni] === " ") ni--;
    if (ni < matchIdx) return null; // entire match is spaces
    endOrig = origEndForNorm[ni];
    // Extend to include trailing whitespace in original
    while (endOrig < originalText.length && /\s/.test(originalText[endOrig])) {
      endOrig++;
    }
  } else {
    endOrig = origEndForNorm[matchEnd - 1];
  }

  if (startOrig === undefined || endOrig === undefined) return null;
  return { start: startOrig, end: endOrig };
}
