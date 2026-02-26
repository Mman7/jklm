import { useEffect, useRef } from "react";
import useQuestion from "../zustands/useQuestionStore";
import useTimer from "../hooks/useTimer";
import useShowAnswer from "../zustands/useShowAnswerStore";
import useGame from "../zustands/useGameStore";

export default function Timer() {
  const { currentQuestion } = useQuestion();
  const { showAnswer, setShowAnswer } = useShowAnswer();
  const { showPicture } = useGame();
  const isImageNotReady = !!currentQuestion?.challenge.image && !showPicture;

  const timeLeft = useTimer(
    currentQuestion?.challenge.end_time ?? null,
    isImageNotReady,
  );

  // Ref to track previous expired state
  const prevExpiredRef = useRef(false);

  useEffect(() => {
    setShowAnswer(false);
    prevExpiredRef.current = false;
  }, [currentQuestion?.challenge.hash]);

  useEffect(() => {
    if (showAnswer) return;

    if (timeLeft.isExpired && !prevExpiredRef.current) {
      prevExpiredRef.current = true;
      timeLeft.isExpired = false;
      setShowAnswer(true);
    }
  }, [setShowAnswer, showAnswer, timeLeft.isExpired]);

  const minutes = Math.floor(timeLeft.totalMs / 60000);
  const seconds = Math.floor((timeLeft.totalMs % 60000) / 1000);

  return (
    <div>
      {showAnswer || timeLeft.isExpired ? (
        <span>0:00 s</span>
      ) : (
        <span>
          {minutes}:{seconds.toString().padStart(2, "0")} s
        </span>
      )}
    </div>
  );
}
