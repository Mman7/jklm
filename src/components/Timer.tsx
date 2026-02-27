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
    <div className="flex items-center gap-2">
      <svg
        className="text-primary h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {showAnswer || timeLeft.isExpired ? (
        <span className="text-error font-mono text-lg font-semibold">0:00</span>
      ) : (
        <span className="text-primary font-mono text-lg font-semibold">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      )}
    </div>
  );
}
