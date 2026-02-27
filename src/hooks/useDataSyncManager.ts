import { useEffect, useRef, useCallback } from "react";
import { SyncDataMessage } from "../types/sync_data";
import useGame from "../zustands/useGameStore";
import useQuestion from "../zustands/useQuestionStore";
import {
  sendSyncData,
  sendSyncRequest,
  subscribeToSync,
} from "../library/client/ably_client";
import useRoom from "../zustands/useRoomStore";
import useMounted from "./useMounted";
import useAuth from "../zustands/useAuthStore";
import useShowAnswer from "../zustands/useShowAnswerStore";

const BROADCAST_REQUESTER_ID = "all";

export default function useDataSyncManager() {
  const { timer } = useGame();
  const { playerId } = useAuth();
  const { showAnswer, setShowAnswer } = useShowAnswer();
  const {
    currentQuestion,
    currentQuestionHash,
    setCurrentQuestion,
    setCurrentQuestionHash,
  } = useQuestion();
  const { channel } = useRoom();
  const mounted = useMounted();
  // TODO fix second question infinite loading

  // Store latest values without triggering effect re-run
  const timerRef = useRef(timer);
  const questionRef = useRef(currentQuestionHash);
  const currentQuestionRef = useRef(currentQuestion);
  const pendingSyncedEndTimeRef = useRef<{
    hash: string;
    endTimeMs: number;
  } | null>(null);
  const hasAppliedIncomingSyncRef = useRef(false);
  const showAnswerRef = useRef(showAnswer);

  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  useEffect(() => {
    questionRef.current = currentQuestionHash;
  }, [currentQuestionHash]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    showAnswerRef.current = showAnswer;
  }, [showAnswer]);

  useEffect(() => {
    hasAppliedIncomingSyncRef.current = false;
    pendingSyncedEndTimeRef.current = null;
  }, [currentQuestionHash?.hash]);

  const sendSync = useCallback(
    (requesterId: string) => {
      if (!playerId) return;

      const currentQuestionHash = questionRef.current;
      const currentQuestion = currentQuestionRef.current;
      const currentTimer = timerRef.current;

      if (!currentQuestionHash || currentTimer === null) return;
      if (
        !currentQuestion ||
        currentQuestion.challenge.hash !== currentQuestionHash.hash
      ) {
        return;
      }
      if (!showAnswerRef.current && currentTimer <= 0) return;

      const syncData = {
        currentQuestionHash,
        timer: {
          totalMs: Math.max(currentTimer, 0),
          isExpired: currentTimer <= 0,
        },
        isShowingAnswer: showAnswerRef.current,
      };

      sendSyncData({
        requesterId,
        senderId: playerId,
        syncData,
      });
    },
    [playerId],
  );

  const sendReqSync = useCallback(() => {
    if (!playerId) return;
    hasAppliedIncomingSyncRef.current = false;
    pendingSyncedEndTimeRef.current = null;
    sendSyncRequest(playerId);
  }, [playerId]);

  useEffect(() => {
    if (!mounted || !channel) return;

    const unsubscribe = subscribeToSync((syncMessage) => {
      if (syncMessage.type === "sync_request") {
        if (!playerId || syncMessage.requesterId === playerId) return;
        sendSync(syncMessage.requesterId);
        return;
      }

      const dataMessage = syncMessage as SyncDataMessage;

      if (!playerId) return;
      const isBroadcast = dataMessage.requesterId === BROADCAST_REQUESTER_ID;
      const isTargetedToMe =
        dataMessage.requesterId === playerId &&
        dataMessage.senderId !== playerId;

      if (!isBroadcast && !isTargetedToMe) return;
      if (dataMessage.senderId === playerId) return;

      const syncData = dataMessage.payload;
      const incomingHash = syncData.currentQuestionHash.hash;
      const localHash = questionRef.current?.hash;
      const isSameQuestion = localHash === incomingHash;

      if (isTargetedToMe && hasAppliedIncomingSyncRef.current && isSameQuestion)
        return;

      if (isTargetedToMe) {
        hasAppliedIncomingSyncRef.current = true;
      }

      if (!syncData.isShowingAnswer && syncData.timer.totalMs <= 0) return;

      setShowAnswer(syncData.isShowingAnswer);

      setCurrentQuestionHash(syncData.currentQuestionHash);

      const syncedEndTimeMs = Date.now() + Math.max(syncData.timer.totalMs, 0);
      const questionHash = syncData.currentQuestionHash.hash;
      const localCurrentQuestion = currentQuestion;

      if (
        localCurrentQuestion &&
        localCurrentQuestion.challenge.hash === questionHash
      ) {
        setCurrentQuestion({
          ...localCurrentQuestion,
          challenge: {
            ...localCurrentQuestion.challenge,
            end_time: syncedEndTimeMs,
          },
        });
        return;
      }

      pendingSyncedEndTimeRef.current = {
        hash: questionHash,
        endTimeMs: syncedEndTimeMs,
      };
    });

    return unsubscribe;
  }, [
    channel,
    currentQuestion,
    mounted,
    playerId,
    sendSync,
    setShowAnswer,
    setCurrentQuestion,
    setCurrentQuestionHash,
  ]);

  useEffect(() => {
    const pendingSync = pendingSyncedEndTimeRef.current;
    const localCurrentQuestion = currentQuestion;

    if (!pendingSync || !localCurrentQuestion) return;
    if (localCurrentQuestion.challenge.hash !== pendingSync.hash) return;

    setCurrentQuestion({
      ...localCurrentQuestion,
      challenge: {
        ...localCurrentQuestion.challenge,
        end_time: pendingSync.endTimeMs,
      },
    });

    pendingSyncedEndTimeRef.current = null;
  }, [currentQuestion, setCurrentQuestion]);

  useEffect(() => {
    if (!mounted || !channel || !playerId) return;

    const intervalId = setInterval(() => {
      sendSync(BROADCAST_REQUESTER_ID);
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [channel, mounted, playerId, sendSync]);

  return { sendSync, sendReqSync };
}
