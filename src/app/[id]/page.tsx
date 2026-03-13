"use client";

import ChallengeDisplayer from "@/src/components/game/ChallengeDisplayer";
import GameJoinStatus from "@/src/components/game/GameJoinStatus";
import PlayerListChat from "@/src/components/game/PlayerListChat";
import PlayerInput from "@/src/components/PlayerInput";
import Timer from "@/src/components/Timer";
import Correct from "@/src/components/game/correct";
import { useLastChat } from "@/src/hooks/useLastChat";
import useDataSyncManager from "@/src/hooks/useDataSyncManager";
import useGamePageBootstrap from "@/src/hooks/useGamePageBootstrap";
import useJoinSync from "@/src/hooks/useJoinSync";
import useMounted from "@/src/hooks/useMounted";
import usePlayerInputAutoFocus from "@/src/hooks/usePlayerInputAutoFocus";
import useRoomEvent from "@/src/hooks/useRoomEvent";
import useRoundCompletionHandler from "@/src/hooks/useRoundCompletionHandler";
import usePlayerStatsUpdater from "@/src/hooks/usePlayerStats";
import useUserValid from "@/src/hooks/useUserValid";
import { enterChannel } from "@/src/library/client/ably_client";
import { useAuthStore } from "@/src/zustands/useAuthStore";
import {
  useQuestionActions,
  useQuestionStore,
} from "@/src/zustands/useQuestionStore";
import { useNameDialogStore } from "@/src/zustands/useNameDialogStore";
import { useRoomStore } from "@/src/zustands/useRoomStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useRoomInitializer from "@/src/hooks/useRoomInitializer";
import { useShowAnswerStore } from "@/src/zustands/useShowAnswerStore";
import { useGameActions, useGameStore } from "@/src/zustands/useGameStore";
import ShowAnswer from "@/src/components/ShowAnswer";
import { useRoomPlayers } from "@/src/hooks/useRoomPlayers";
import { PlayerStatus } from "@/src/types/enum/player_status";
import { Trophy, Users, X } from "lucide-react";

export default function GamePage() {
  const playerId = useAuthStore((s) => s.playerId);
  const name = useAuthStore((s) => s.name);
  const params = useParams();
  const roomId = typeof params.id === "string" ? params.id : "";
  const setChannel = useRoomStore((s) => s.setChannel);
  const updatePlayerStats = useRoomStore((s) => s.updatePlayerStats);
  const player = useRoomStore((s) => s.player);
  const room = useRoomStore((s) => s.room);
  const channel = useRoomStore((s) => s.channel);
  const mounted = useMounted();
  const { isUserValid } = useUserValid();
  const setShowNameDialog = useNameDialogStore((s) => s.setShowNameDialog);
  const { setCurrentQuestionHash } = useQuestionActions();
  const currentQuestionHash = useQuestionStore((s) => s.currentQuestionHash);
  const questionList = useQuestionStore((s) => s.questionList);
  const showAnswer = useShowAnswerStore((s) => s.showAnswer);
  const { setGameReady } = useGameActions();
  const timer = useGameStore((s) => s.timer);
  const { players } = useRoomPlayers(channel);
  const [hasJoinedGame, setHasJoinedGame] = useState(false);
  const [joinedQuestionHash, setJoinedQuestionHash] = useState<string | null>(
    null,
  );
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [isMobilePlayerListOpen, setIsMobilePlayerListOpen] = useState(false);
  const [lastCorrectQuestionHash, setLastCorrectQuestionHash] = useState<
    string | null
  >(null);
  const { sendReqSync } = useDataSyncManager();
  const { playerInputContainerRef } = usePlayerInputAutoFocus({
    currentQuestionHash,
    hasJoinedGame,
    joinedQuestionHash,
    showAnswer,
  });

  useEffect(() => {
    setShowCorrectAnimation(false);
  }, [currentQuestionHash?.hash]);

  Timer();

  // Show correct animation when player answers correctly
  useEffect(() => {
    if (
      player?.playerStatus === PlayerStatus.answer_correct &&
      currentQuestionHash?.hash &&
      lastCorrectQuestionHash !== currentQuestionHash.hash
    ) {
      setShowCorrectAnimation(true);
      setLastCorrectQuestionHash(currentQuestionHash.hash);
    }
  }, [
    player?.playerStatus,
    currentQuestionHash?.hash,
    lastCorrectQuestionHash,
  ]);

  // initialize channel
  useLastChat();
  useRoomEvent();
  usePlayerStatsUpdater(hasJoinedGame);
  useRoomInitializer();

  useGamePageBootstrap({
    mounted,
    isUserValid,
    setShowNameDialog,
    roomId,
    playerId,
    setChannel,
    room,
    name,
    updatePlayerStats,
    questionList,
    currentQuestionHash,
    setCurrentQuestionHash,
  });

  useJoinSync({ channel, player, hasJoinedGame, sendReqSync });

  useRoundCompletionHandler({
    currentQuestionHash,
    hasJoinedGame,
    showAnswer,
    playerId,
    players,
    questionList,
    roomId,
  });

  const isGameReady = players.length >= 1;

  useEffect(() => {
    setGameReady(isGameReady);
  }, [isGameReady, setGameReady]);

  useEffect(() => {
    return () => {
      setGameReady(false);
    };
  }, [setGameReady]);

  useEffect(() => {
    if (!isMobilePlayerListOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobilePlayerListOpen]);

  if (!channel) return <div>Loading...</div>;

  const isBlockedForCurrentQuestion =
    hasJoinedGame &&
    !!joinedQuestionHash &&
    currentQuestionHash?.hash === joinedQuestionHash;

  const totalRounds = Math.max(questionList.length, 1);
  const foundRoundIndex = currentQuestionHash?.hash
    ? questionList.findIndex(
        (question) => question.hash === currentQuestionHash.hash,
      )
    : 0;
  const currentRound = foundRoundIndex >= 0 ? foundRoundIndex + 1 : 1;

  const questionDurationMs = (room?.questionDurationSeconds ?? 20) * 1000;
  const remainingMs = showAnswer ? 0 : (timer ?? questionDurationMs);
  const timerProgressPercent =
    hasJoinedGame && isGameReady
      ? Math.max(0, Math.min(100, (remainingMs / questionDurationMs) * 100))
      : 100;

  const handleJoinGame = () => {
    if (!player || hasJoinedGame) return;

    const isFirstJoiner = players.length === 0;

    enterChannel(player);

    // only late joiners are blocked for the current question
    setJoinedQuestionHash(
      isFirstJoiner ? null : (currentQuestionHash?.hash ?? null),
    );

    setHasJoinedGame(true);
  };

  return (
    <div className="bg-base-200/50 flex h-full w-full max-w-full gap-3 lg:ml-6">
      {showCorrectAnimation && <Correct />}
      {showAnswer ? (
        <ShowAnswer />
      ) : (
        <section className="flex-3">
          <header className="border-base-content/10 bg-base-100 my-3 flex h-16 items-center justify-between gap-4 rounded-3xl border-b px-4">
            <section className="flex items-center gap-2">
              <Trophy size={14} className="text-primary" />
              <div className="leading-tight">
                <p className="text-[9px] font-semibold tracking-wide opacity-60">
                  ROUND
                </p>
                <p className="text-sm font-bold">
                  {currentRound} of {totalRounds}
                </p>
              </div>
            </section>

            <section className="flex flex-1 flex-col items-center gap-1">
              <progress
                className="progress progress-primary h-1.5 w-full max-w-55"
                value={timerProgressPercent}
                max={100}
              />
            </section>

            <section className="flex min-w-30 items-center justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm lg:hidden"
                onClick={() => setIsMobilePlayerListOpen(true)}
                aria-label="Open player list"
              >
                <Users size={14} />
                <span>Players ({players.length})</span>
              </button>
              <div className="text-right leading-tight">
                <GameJoinStatus
                  hasJoinedGame={hasJoinedGame}
                  isGameReady={isGameReady}
                  canJoinGame={!!player}
                  onJoinGame={handleJoinGame}
                />
              </div>
            </section>
          </header>
          <main className="bg-base-100/20 h-[calc(100%-13rem)]">
            {!hasJoinedGame ? (
              <div className="border-base-content/10 bg-base-100/40 flex h-full items-center justify-center border p-6 backdrop-blur-xl">
                <p className="text-base-content/70 text-center">
                  Click "Join game" to join room and show yourself in player
                  list.
                </p>
              </div>
            ) : !isGameReady ? (
              <div className="border-base-content/10 bg-base-100/40 flex h-full items-center justify-center border p-6 backdrop-blur-xl">
                <p className="text-base-content/70 text-center">
                  Waiting for one more player to join.
                </p>
              </div>
            ) : (
              <>
                <ChallengeDisplayer />
                {isBlockedForCurrentQuestion ? (
                  <div className="px-4 py-2 text-center text-sm text-gray-700">
                    You joined mid-question. You can answer starting from the
                    next question.
                  </div>
                ) : (
                  <div ref={playerInputContainerRef}>
                    <PlayerInput />
                  </div>
                )}
              </>
            )}
          </main>
        </section>
      )}

      <PlayerListChat className="m-2 hidden lg:flex" />

      {isMobilePlayerListOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="bg-base-content/40 absolute inset-0"
            onClick={() => setIsMobilePlayerListOpen(false)}
            aria-label="Close player list"
          />
          <div className="absolute top-0 right-0 h-full w-[min(22rem,92vw)] p-2">
            <PlayerListChat
              className="h-full w-full"
              headerAction={
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setIsMobilePlayerListOpen(false)}
                  aria-label="Close player list"
                >
                  <X size={14} />
                </button>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
