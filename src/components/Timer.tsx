import { useEffect, useRef } from "react";
import { useQuestionStore } from "../zustands/useQuestionStore";
import useTimer from "../hooks/useTimer";
import { useShowAnswerStore } from "../zustands/useShowAnswerStore";
import { useGameStore } from "../zustands/useGameStore";
import { useLoadingStore } from "../zustands/useLoadingStore";

export default function Timer() {
  const currentQuestion = useQuestionStore((s) => s.currentQuestion);
  const currentQuestionHash = useQuestionStore((s) => s.currentQuestionHash);
  const showAnswer = useShowAnswerStore((s) => s.showAnswer);
  const setShowAnswer = useShowAnswerStore((s) => s.setShowAnswer);
  const showPicture = useGameStore((s) => s.showPicture);
  const showLoading = useLoadingStore((s) => s.showLoading);
  const isCurrentQuestionAligned =
    !!currentQuestionHash?.hash &&
    currentQuestion?.challenge.hash === currentQuestionHash.hash;

  const activeEndTimeMs = isCurrentQuestionAligned
    ? currentQuestion.challenge.end_time
    : null;

  const isImageNotReady =
    isCurrentQuestionAligned &&
    !!currentQuestion.challenge.image &&
    !showPicture;
  const isTimerPaused = isImageNotReady || showLoading;

  const timeLeft = useTimer(activeEndTimeMs, isTimerPaused);

  // Ref to track previous expired state
  const prevExpiredRef = useRef(false);

  useEffect(() => {
    setShowAnswer(false);
    prevExpiredRef.current = false;
  }, [currentQuestionHash?.hash, setShowAnswer]);

  useEffect(() => {
    if (showAnswer) return;
    if (!isCurrentQuestionAligned || !activeEndTimeMs) return;

    if (timeLeft.isExpired && !prevExpiredRef.current) {
      prevExpiredRef.current = true;
      setShowAnswer(true);
    }
  }, [
    activeEndTimeMs,
    isCurrentQuestionAligned,
    setShowAnswer,
    showAnswer,
    timeLeft.isExpired,
  ]);
}
