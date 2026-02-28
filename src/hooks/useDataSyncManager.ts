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

  // Keep latest values in refs so callbacks/subscriptions always read fresh state
  // without forcing re-subscription on every render.
  const timerRef = useRef(timer);
  const questionRef = useRef(currentQuestionHash);
  const currentQuestionRef = useRef(currentQuestion);
  // If sync arrives before the full question object is loaded, cache end_time here
  // and apply it once matching question data is available.
  const pendingSyncedEndTimeRef = useRef<{
    hash: string;
    endTimeMs: number;
  } | null>(null);
  const syncSeqRef = useRef(0);
  const lastAppliedSyncSeqRef = useRef<Record<string, number>>({});
  // Prevent repeatedly applying the same targeted sync payload.
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
    // New question means old sync guards are no longer valid.
    hasAppliedIncomingSyncRef.current = false;
    pendingSyncedEndTimeRef.current = null;
    lastAppliedSyncSeqRef.current = {};
  }, [currentQuestionHash?.hash]);

  const sendSync = useCallback(
    (requesterId: string) => {
      // Cannot publish sync without local identity.
      if (!playerId) return;

      const currentQuestionHash = questionRef.current;
      const currentQuestion = currentQuestionRef.current;
      const currentTimer = timerRef.current;

      // Only sync when we have a valid local round context.
      if (!currentQuestionHash || currentTimer === null) return;
      if (
        !currentQuestion ||
        currentQuestion.challenge.hash !== currentQuestionHash.hash
      ) {
        return;
      }
      // Ignore negative/expired timer broadcasts unless answer phase is shown.
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
        seq: (syncSeqRef.current += 1),
        syncData,
      });
    },
    [playerId],
  );

  const sendReqSync = useCallback(() => {
    if (!playerId) return;
    // Fresh request should accept one incoming targeted sync again.
    hasAppliedIncomingSyncRef.current = false;
    pendingSyncedEndTimeRef.current = null;
    sendSyncRequest(playerId);
  }, [playerId]);

  useEffect(() => {
    if (!mounted || !channel) return;

    const unsubscribe = subscribeToSync((syncMessage) => {
      // Another player asks for direct sync; respond with current snapshot.
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

      // Accept only broadcast sync or direct sync addressed to this player.
      if (!isBroadcast && !isTargetedToMe) return;
      // Never process our own sync message.
      if (dataMessage.senderId === playerId) return;

      const syncData = dataMessage.payload;
      const incomingHash = syncData.currentQuestionHash.hash;
      const localHash = questionRef.current?.hash;
      const isSameQuestion = localHash === incomingHash;
      const hasLocalQuestion = !!localHash;
      const sourceKey = `${dataMessage.senderId}:${incomingHash}`;
      const hasSequence = typeof dataMessage.seq === "number";
      const incomingSeq = dataMessage.seq ?? 0;
      const lastAppliedSeq = lastAppliedSyncSeqRef.current[sourceKey] ?? -1;

      if (hasSequence && incomingSeq <= lastAppliedSeq) return;

      if (hasSequence) {
        lastAppliedSyncSeqRef.current[sourceKey] = incomingSeq;
      }

      // For targeted sync, apply once per same-question context.
      if (isTargetedToMe && hasAppliedIncomingSyncRef.current && isSameQuestion)
        return;

      if (isTargetedToMe) {
        hasAppliedIncomingSyncRef.current = true;
      }

      // Same rule as sender side: avoid applying an already-finished timer unless
      // the round is explicitly in answer phase.
      if (!syncData.isShowingAnswer && syncData.timer.totalMs <= 0) return;

      if (hasLocalQuestion && !isSameQuestion) {
        // Question changed locally; never carry answer-phase UI across hashes.
        setShowAnswer(false);
      } else {
        setShowAnswer(syncData.isShowingAnswer);
      }

      setCurrentQuestionHash(syncData.currentQuestionHash);

      const syncedEndTimeMs = Date.now() + Math.max(syncData.timer.totalMs, 0);
      const questionHash = syncData.currentQuestionHash.hash;
      const localCurrentQuestion = currentQuestionRef.current;

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

      // Question object not loaded yet; defer end_time update.
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
    // Apply deferred sync timing once matching question data becomes available.
    const pendingSync = pendingSyncedEndTimeRef.current;
    const localCurrentQuestion = currentQuestionRef.current;

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

    // Periodic lightweight broadcast so late joiners drift less before manual sync.
    const intervalId = setInterval(() => {
      sendSync(BROADCAST_REQUESTER_ID);
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [channel, mounted, playerId, sendSync]);

  return { sendSync, sendReqSync };
}
