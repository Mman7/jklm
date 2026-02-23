import React from "react";
import useGame from "../zustands/useGameStore";
import useTimer from "../hooks/useTimer";

export default function Timer() {
  const { goToNextQuestion, currentQuestion } = useGame();

  const timeLeft = useTimer(currentQuestion?.challenge.end_time || 0);

  React.useEffect(() => {
    if (timeLeft.isExpired) {
      goToNextQuestion();
    }
  }, [timeLeft.isExpired]);

  return (
    <div>
      {timeLeft.isExpired ? (
        <span>Time's up!</span>
      ) : (
        <span>{timeLeft.seconds} seconds left</span>
      )}
    </div>
  );
}
