import { useEffect, useRef, useCallback } from "react";
import { SyncDataMessage } from "../types/sync_data";
import { useGameStore } from "../zustands/useGameStore";
import {
  useQuestionActions,
  useQuestionStore,
} from "../zustands/useQuestionStore";
import {
  sendSyncData,
  sendSyncRequest,
  subscribeToSync,
} from "../library/client/ably_client";
import { useRoomStore } from "../zustands/useRoomStore";
import useMounted from "./useMounted";
import { useAuthStore } from "../zustands/useAuthStore";
import { useShowAnswerStore } from "../zustands/useShowAnswerStore";

const BROADCAST_REQUESTER_ID = "all";

function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

export default function useDataSyncManager() {
  const timer = useGameStore((s) => s.timer);
  const playerId = useAuthStore((s) => s.playerId);
  const showAnswer = useShowAnswerStore((s) => s.showAnswer);
  const setShowAnswer = useShowAnswerStore((s) => s.setShowAnswer);
  const currentQuestion = useQuestionStore((s) => s.currentQuestion);
  const currentQuestionHash = useQuestionStore((s) => s.currentQuestionHash);
  const { setCurrentQuestionHash, setCurrentQuestion } = useQuestionActions();
  const channel = useRoomStore((s) => s.channel);
  const mounted = useMounted();

  // Keep latest values in refs so callbacks/subscriptions always read fresh state
  // without forcing re-subscription on every render.
  const timerRef = useLatest(timer);
  const questionRef = useLatest(currentQuestionHash);
  const currentQuestionRef = useLatest(currentQuestion);
  const round = useGameStore((s) => s.round);
  const roundRef = useLatest(round);
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
  const showAnswerRef = useLatest(showAnswer);

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
      const currentRound = roundRef.current ?? 1;

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

      //
      const syncData = {
        currentQuestionHash,
        timer: {
          totalMs: Math.max(currentTimer, 0),
          isExpired: currentTimer <= 0,
        },
        isShowingAnswer: showAnswerRef.current,
        round: currentRound,
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
      // Apply incoming round value to local store
      if (typeof syncData.round === "number") {
        useGameStore.setState({ round: syncData.round });
      }

      const incoming = {
        hash: syncData.currentQuestionHash.hash,
        seq: dataMessage.seq ?? 0,
        hasSequence: typeof dataMessage.seq === "number",
      };

      const local = {
        hash: questionRef.current?.hash,
      };

      const syncComparison = {
        isSameQuestion: local.hash === incoming.hash,
        hasLocalQuestion: !!local.hash,
        sourceKey: `${dataMessage.senderId}:${incoming.hash}`,
      };

      const lastAppliedSeq =
        lastAppliedSyncSeqRef.current[syncComparison.sourceKey] ?? -1;

      if (incoming.hasSequence && incoming.seq <= lastAppliedSeq) return;

      if (incoming.hasSequence) {
        lastAppliedSyncSeqRef.current[syncComparison.sourceKey] = incoming.seq;
      }

      // For targeted sync, apply once per same-question context.
      if (
        isTargetedToMe &&
        hasAppliedIncomingSyncRef.current &&
        syncComparison.isSameQuestion
      )
        return;

      if (isTargetedToMe) {
        hasAppliedIncomingSyncRef.current = true;
      }

      // Same rule as sender side: avoid applying an already-finished timer unless
      // the round is explicitly in answer phase.
      if (!syncData.isShowingAnswer && syncData.timer.totalMs <= 0) return;

      if (syncComparison.hasLocalQuestion && !syncComparison.isSameQuestion) {
        // Question changed locally; never carry answer-phase UI across hashes.
        setShowAnswer(false);
      } else {
        setShowAnswer(syncData.isShowingAnswer);
      }

      if (!syncComparison.isSameQuestion) {
        setCurrentQuestionHash(syncData.currentQuestionHash);
      }

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
