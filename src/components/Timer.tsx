import { useEffect, useRef } from "react";
import useGame from "../zustands/useGameStore";
import useQuestion from "../zustands/useQuestionStore";
import useTimer from "../hooks/useTimer";
import useGameController from "../hooks/useGameController";
import useShowAnswer from "../zustands/useShowAnswerStore";

export default function Timer() {
  const { showPicture } = useGame();
  const { currentQuestion } = useQuestion();
  const { handleGoToNextQuestion } = useGameController();
  const { showAnswer } = useShowAnswer();

  const timeLeft = useTimer(
    showPicture && !showAnswer ? currentQuestion?.challenge.end_time || 0 : 0,
  );

  // Ref to track previous expired state
  const prevExpiredRef = useRef(false);

  useEffect(() => {
    if (!currentQuestion || showAnswer) return;

    if (timeLeft.isExpired && !prevExpiredRef.current && showPicture) {
      handleGoToNextQuestion();
    }

    prevExpiredRef.current = timeLeft.isExpired;
  }, [timeLeft.isExpired, showPicture, currentQuestion, showAnswer]);

  return (
    <div>
      {timeLeft.isExpired ? (
        <span>Time's up!</span>
      ) : (
        <span>
          {timeLeft.minutes}:{timeLeft.seconds} s
        </span>
      )}
    </div>
  );
}
