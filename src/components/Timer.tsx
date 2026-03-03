import { useEffect, useRef } from "react";
import useQuestion from "../zustands/useQuestionStore";
import useTimer from "../hooks/useTimer";
import useShowAnswer from "../zustands/useShowAnswerStore";
import useGame from "../zustands/useGameStore";
import useLoadingDialog from "../zustands/useLoadingStore";

export default function Timer() {
  const { currentQuestion, currentQuestionHash } = useQuestion();
  const { showAnswer, setShowAnswer } = useShowAnswer();
  const { showPicture } = useGame();
  const { showLoading } = useLoadingDialog();
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
