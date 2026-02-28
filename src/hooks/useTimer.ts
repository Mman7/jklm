import { useEffect, useRef, useState } from "react";
import useGame from "../zustands/useGameStore";

/**
 * Custom hook for managing a countdown timer with pause/resume functionality.
 * Calculates remaining time and updates a global game store state.
 *
 * @param endTimeMs - The target end timestamp in milliseconds (null if timer is not active)
 * @param paused - Boolean flag indicating if the timer is currently paused (default: false)
 * @returns Object containing remaining time in milliseconds and expiration status
 */
export default function useTimer(endTimeMs: number | null, paused = false) {
  // Ref to hold the active interval ID for clearing it on cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ref to store the target end time, used for calculations
  const effectiveEndTimeRef = useRef<number | null>(endTimeMs);

  // Ref to store remaining time when timer is paused
  const pausedRemainingMsRef = useRef(0);

  // Ref to track the previous pause state, used to detect state changes
  const wasPausedRef = useRef(paused);

  // Hook to update the global game timer state
  const { setTimer } = useGame();

  /**
   * Calculates time remaining until the target end time.
   * Handles cases where the target might be null (no active timer).
   *
   * @param targetEndTimeMs - The target end timestamp in milliseconds
   * @returns Object with total remaining milliseconds and expiration status
   */
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

  // Initialize time left state based on the initial endTimeMs
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTimeMs));

  // Effect: Syncs the hook's local state with the global game store whenever totalMs changes
  useEffect(() => {
    setTimer(timeLeft.totalMs);
  }, [timeLeft.totalMs, setTimer]);

  // Effect: Updates refs and local state when the target endTimeMs changes (e.g., reset timer)
  useEffect(() => {
    if (!endTimeMs) {
      // Reset timer state if no end time is provided
      effectiveEndTimeRef.current = null;
      pausedRemainingMsRef.current = 0;
      wasPausedRef.current = paused;
      setTimeLeft({ totalMs: 0, isExpired: false });
      return;
    }

    // Update refs and calculate remaining time if a new end time is set
    effectiveEndTimeRef.current = endTimeMs;
    pausedRemainingMsRef.current = Math.max(endTimeMs - Date.now(), 0);
    wasPausedRef.current = paused;

    if (paused) {
      // Set state directly if the timer is currently paused
      setTimeLeft({
        totalMs: pausedRemainingMsRef.current,
        isExpired: pausedRemainingMsRef.current <= 0,
      });
      return;
    }

    setTimeLeft(calculateTimeLeft(endTimeMs));
  }, [endTimeMs]);

  // Effect: Handles pause/resume logic by manipulating effectiveEndTimeRef based on previous state
  useEffect(() => {
    const targetEndTimeMs = effectiveEndTimeRef.current;

    if (!targetEndTimeMs) {
      wasPausedRef.current = paused;
      return;
    }

    if (paused && !wasPausedRef.current) {
      // Timer just went from running to paused: save current remaining time
      const remaining = Math.max(targetEndTimeMs - Date.now(), 0);
      pausedRemainingMsRef.current = remaining;
      setTimeLeft({ totalMs: remaining, isExpired: remaining <= 0 });
    }

    if (!paused && wasPausedRef.current) {
      // Timer just went from paused to running: resume from saved remaining time
      effectiveEndTimeRef.current = Date.now() + pausedRemainingMsRef.current;
      setTimeLeft(calculateTimeLeft(effectiveEndTimeRef.current));
    }

    wasPausedRef.current = paused;
  }, [paused]);

  // Effect: Manages the interval timer loop for real-time countdown updates
  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!endTimeMs || !effectiveEndTimeRef.current) {
      // No active timer to run
      setTimeLeft({ totalMs: 0, isExpired: false });
      return;
    }

    if (paused) {
      // If paused, update remaining time but stop the interval
      const targetEndTimeMs = effectiveEndTimeRef.current;
      const remaining = targetEndTimeMs
        ? Math.max(targetEndTimeMs - Date.now(), 0)
        : 0;
      pausedRemainingMsRef.current = remaining;
      setTimeLeft({ totalMs: remaining, isExpired: false });
      return;
    }

    // Start the countdown interval (runs every 100ms)
    setTimeLeft(calculateTimeLeft(effectiveEndTimeRef.current));

    intervalRef.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft(effectiveEndTimeRef.current));
    }, 100);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endTimeMs, paused]);

  return timeLeft;
}
