import { useEffect, useRef, useState } from "react";
import useGame from "../zustands/useGameStore";

export default function useTimer(endTimeMs: number | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { setTimer } = useGame();

  const calculateTimeLeft = (targetEndTimeMs: number | null) => {
    if (!targetEndTimeMs) {
      return {
        totalMs: 0,
        isExpired: false,
      };
    }
    const diff = targetEndTimeMs - Date.now();

    return {
      totalMs: Math.max(diff, 0),
      isExpired: diff <= 0,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTimeMs));

  useEffect(() => {
    setTimer(timeLeft.totalMs);
  }, [timeLeft.totalMs, setTimer]);

  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!endTimeMs) {
      setTimeLeft({ totalMs: 0, isExpired: false });
      return;
    }

    setTimeLeft(calculateTimeLeft(endTimeMs));

    intervalRef.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTimeMs));
    }, 100); // Adjust interval as needed for ms precision

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endTimeMs]);

  return timeLeft;
}
