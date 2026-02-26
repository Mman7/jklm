import { useEffect, useRef, useState } from "react";
import useGame from "../zustands/useGameStore";

export default function useTimer(endTimeMs: number | null, paused = false) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const effectiveEndTimeRef = useRef<number | null>(endTimeMs);
  const pausedRemainingMsRef = useRef(0);
  const wasPausedRef = useRef(paused);
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
    if (!endTimeMs) {
      effectiveEndTimeRef.current = null;
      pausedRemainingMsRef.current = 0;
      wasPausedRef.current = paused;
      setTimeLeft({ totalMs: 0, isExpired: false });
      return;
    }

    effectiveEndTimeRef.current = endTimeMs;
    pausedRemainingMsRef.current = Math.max(endTimeMs - Date.now(), 0);
    wasPausedRef.current = paused;

    if (paused) {
      setTimeLeft({
        totalMs: pausedRemainingMsRef.current,
        isExpired: pausedRemainingMsRef.current <= 0,
      });
      return;
    }

    setTimeLeft(calculateTimeLeft(endTimeMs));
  }, [endTimeMs]);

  useEffect(() => {
    const targetEndTimeMs = effectiveEndTimeRef.current;

    if (!targetEndTimeMs) {
      wasPausedRef.current = paused;
      return;
    }

    if (paused && !wasPausedRef.current) {
      const remaining = Math.max(targetEndTimeMs - Date.now(), 0);
      pausedRemainingMsRef.current = remaining;
      setTimeLeft({ totalMs: remaining, isExpired: remaining <= 0 });
    }

    if (!paused && wasPausedRef.current) {
      effectiveEndTimeRef.current = Date.now() + pausedRemainingMsRef.current;
      setTimeLeft(calculateTimeLeft(effectiveEndTimeRef.current));
    }

    wasPausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!endTimeMs || !effectiveEndTimeRef.current) {
      setTimeLeft({ totalMs: 0, isExpired: false });
      return;
    }

    if (paused) {
      const targetEndTimeMs = effectiveEndTimeRef.current;
      const remaining = targetEndTimeMs
        ? Math.max(targetEndTimeMs - Date.now(), 0)
        : 0;
      pausedRemainingMsRef.current = remaining;
      setTimeLeft({ totalMs: remaining, isExpired: false });
      return;
    }

    setTimeLeft(calculateTimeLeft(effectiveEndTimeRef.current));

    intervalRef.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft(effectiveEndTimeRef.current));
    }, 100); // Adjust interval as needed for ms precision

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endTimeMs, paused]);

  return timeLeft;
}
