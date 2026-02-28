import { useEffect, useRef } from "react";
import { QuestionHashOnly } from "../types/question";

type UsePlayerInputAutoFocusParams = {
  currentQuestionHash: QuestionHashOnly | null;
  hasJoinedGame: boolean;
  joinedQuestionHash: string | null;
  showAnswer: boolean;
};

/**
 * Custom hook for managing auto-focus behavior on player input elements.
 * Ensures the appropriate input receives focus based on game state and visibility.
 */
export default function usePlayerInputAutoFocus({
  currentQuestionHash,
  hasJoinedGame,
  joinedQuestionHash,
  showAnswer,
}: UsePlayerInputAutoFocusParams) {
  // Ref to access the DOM container for the player input
  const playerInputContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Determines if auto-focus should be blocked for the current question state
    const isBlockedForCurrentQuestion =
      hasJoinedGame &&
      !joinedQuestionHash &&
      currentQuestionHash?.hash === joinedQuestionHash;

    // Return early if conditions prevent focus or if the answer is visible
    if (!hasJoinedGame || isBlockedForCurrentQuestion || showAnswer) return;

    // Use requestAnimationFrame to defer focus until the next paint for optimal timing
    const rafId = requestAnimationFrame(() => {
      const root = playerInputContainerRef.current;
      // Query selector finds the first interactive input element that is visible and enabled
      const inputEl = root?.querySelector<
        HTMLInputElement | HTMLTextAreaElement
      >(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), [contenteditable="true"]',
      );
      inputEl?.focus();
    });

    // Cleanup function to cancel pending frame if the effect unmounts or dependencies change
    return () => cancelAnimationFrame(rafId);
  }, [
    // Dependencies for the effect: ensure re-run when state changes
    currentQuestionHash?.hash,
    hasJoinedGame,
    joinedQuestionHash,
    showAnswer,
  ]);

  // Return the ref for use in the component's JSX
  return { playerInputContainerRef };
}
