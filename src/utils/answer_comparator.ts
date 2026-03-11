// Clean a single token by removing any character that is not
// a lowercase ASCII letter (a-z) or digit (0-9).
// This mirrors the behavior in the original comparator: it
// intentionally drops punctuation and many accented characters
// to produce a simplified matching token.
function cleanToken(token: string): string {
  let out = "";
  for (let i = 0; i < token.length; i++) {
    const ch = token[i];
    const code = ch.charCodeAt(0);
    if ((code >= 97 && code <= 122) || (code >= 48 && code <= 57)) {
      out += ch;
    }
  }
  return out;
}

/**
 * Compare a stored answer to a submitted answer.
 *
 * Matching strategy:
 * 1. Reject empty/whitespace-only submissions.
 * 2. Normalize both strings (trim + toLowerCase) and return true on exact match.
 * 3. Otherwise, split the stored answer into words, "clean" each word
 *    (remove non a-z/0-9 chars) and try to find all cleaned words in order
 *    within the cleaned submitted words. Order must be preserved but words
 *    do not need to be adjacent.
 * 4. If step 3 fails, fallback to checking whether any submitted token
 *    equals the full normalized stored answer.
 *
 * This comparator intentionally strips punctuation and non-ASCII letters
 * when matching word-by-word to be forgiving about punctuation and symbols.
 */
export function AnswerComparator(
  answerInStore: string,
  submitAnswer: string,
): boolean {
  // Prevent empty or whitespace-only submissions.
  if (!submitAnswer || !submitAnswer.trim()) {
    return false;
  }

  // Simple normalization used for exact-match and tokenization.
  const normalizedStore = answerInStore.trim().toLowerCase();
  const normalizedSubmit = submitAnswer.trim().toLowerCase();

  // Exact full-string match wins immediately.
  if (normalizedStore === normalizedSubmit) {
    return true;
  }

  // Build array of cleaned words from the stored answer.
  const answerParts = normalizedStore.split(" ");
  const cleanedAnswerParts = answerParts
    .map(cleanToken)
    .filter((w) => w.length > 0);

  // Walk the submitted tokens and try to find the cleaned answer words
  // in order (not necessarily contiguous).
  const submitParts = normalizedSubmit.split(" ");
  let answerIndex = 0;

  for (const submitWord of submitParts) {
    if (answerIndex >= cleanedAnswerParts.length) break;
    const cleanedSubmitWord = cleanToken(submitWord);
    if (cleanedSubmitWord === cleanedAnswerParts[answerIndex]) answerIndex++;
  }

  // If all cleaned answer words were found in order, consider it correct.
  if (answerIndex === cleanedAnswerParts.length) return true;

  // Fallback: allow any submitted token to exactly match the normalized stored answer.
  return submitParts.includes(normalizedStore);
}

export default AnswerComparator;
