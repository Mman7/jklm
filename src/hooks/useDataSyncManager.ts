import { useEffect, useRef, useCallback } from "react";
import { SyncData } from "../types/sync_data";
import useGame from "../zustands/useGameStore";
import useQuestion from "../zustands/useQuestionStore";
import {
  sendSyncData,
  sendSyncRequest,
  subscribeToSync,
} from "../library/client/ably_client";
import useRoom from "../zustands/useRoomStore";
import useMounted from "./useMounted";

export default function useDataSyncManager() {
  const { timer, setTimer } = useGame();
  const { currentQuestionHash } = useQuestion();
  const { channel } = useRoom();
  const mounted = useMounted();

  // Store latest values without triggering effect re-run
  const timerRef = useRef(timer);
  const questionRef = useRef(currentQuestionHash);

  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  useEffect(() => {
    questionRef.current = currentQuestionHash;
  }, [currentQuestionHash]);

  const sendSync = useCallback(() => {
    const currentTimer = timerRef.current;
    const currentQuestion = questionRef.current;

    if (currentQuestion && currentTimer && !currentTimer.isExpired) {
      console.log(currentTimer);
      const syncData: SyncData = {
        currentQuestionHash: currentQuestion,
        timer: currentTimer,
      };
      sendSyncData(syncData);
    }
  }, []);

  const sendReqSync = useCallback(() => {
    sendSyncRequest();
  }, []);

  useEffect(() => {
    if (!mounted || !channel) return;

    const unsubscribe = subscribeToSync(
      (syncData: SyncData | "sync_request") => {
        if (syncData === "sync_request") {
          sendSync();
          return;
        }
        // TODO handle incoming sync data (e.g., update local state)
        console.log("syncData received:", syncData.timer.totalMs);
      },
    );

    return () => unsubscribe;
  }, [channel, mounted, sendSync]);

  return { sendSync, sendReqSync };
}
