import { useEffect, useRef, useState } from "react";

export default function useCountdown(endTimeMs: number) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateTimeLeft = () => {
    const diff = endTimeMs - Date.now();

    if (diff <= 0) {
      return {
        totalMs: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
    }

    const totalSeconds = Math.floor(diff / 1000);

    return {
      totalMs: diff,
      days: Math.floor(totalSeconds / (60 * 60 * 24)),
      hours: Math.floor((totalSeconds / (60 * 60)) % 24),
      minutes: Math.floor((totalSeconds / 60) % 60),
      seconds: totalSeconds % 60,
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endTimeMs]);

  return timeLeft;
}
