import { useEffect, useRef } from "react";
import { QuestionHashOnly } from "../types/question";

type UsePlayerInputAutoFocusParams = {
  currentQuestionHash: QuestionHashOnly | null;
  hasJoinedGame: boolean;
  joinedQuestionHash: string | null;
  showAnswer: boolean;
};

export default function usePlayerInputAutoFocus({
  currentQuestionHash,
  hasJoinedGame,
  joinedQuestionHash,
  showAnswer,
}: UsePlayerInputAutoFocusParams) {
  const playerInputContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isBlockedForCurrentQuestion =
      hasJoinedGame &&
      !joinedQuestionHash &&
      currentQuestionHash?.hash === joinedQuestionHash;

    if (!hasJoinedGame || isBlockedForCurrentQuestion || showAnswer) return;

    const rafId = requestAnimationFrame(() => {
      const root = playerInputContainerRef.current;
      const inputEl = root?.querySelector<
        HTMLInputElement | HTMLTextAreaElement
      >(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), [contenteditable="true"]',
      );
      inputEl?.focus();
    });

    return () => cancelAnimationFrame(rafId);
  }, [
    currentQuestionHash?.hash,
    hasJoinedGame,
    joinedQuestionHash,
    showAnswer,
  ]);

  return { playerInputContainerRef };
}
