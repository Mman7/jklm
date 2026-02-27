"use client";

import ChallengeDisplayer from "@/src/components/game/ChallengeDisplayer";
import PlayerListChat from "@/src/components/game/PlayerListChat";
import PlayerInput from "@/src/components/PlayerInput";
import TimerBar from "@/src/components/Timer";
import { useLastChat } from "@/src/hooks/useLastChat";
import useDataSyncManager from "@/src/hooks/useDataSyncManager";
import useMounted from "@/src/hooks/useMounted";
import useRoomEvent from "@/src/hooks/useRoomEvent";
import usePlayerStatsUpdater from "@/src/hooks/usePlayerStats";
import useUserValid from "@/src/hooks/useUserValid";
import {
  enterChannel,
  initAbly,
  leaveRoom,
} from "@/src/library/client/ably_client";
import { FetchedStatus, PlayerStatus } from "@/src/types/enum/player_status";
import useAuth from "@/src/zustands/useAuthStore";
import useQuestion from "@/src/zustands/useQuestionStore";
import useNameDialog from "@/src/zustands/useNameDialogStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRef } from "react";
import useRoomInitializer from "@/src/hooks/useRoomInitializer";
import useShowAnswer from "@/src/zustands/useShowAnswerStore";
import ShowAnswer from "@/src/components/ShowAnswer";
import { useRoomPlayers } from "@/src/hooks/useRoomPlayers";
import { noticeServerNewQuestion } from "@/src/library/client/client";
import { Player } from "@/src/types/player";

const checkIsFirstPlayer = (players: Player[], playerId: string) => {
  if (players.length === 0) return false;
  const sortedPlayers = [...players].sort((a, b) =>
    a.playerId.localeCompare(b.playerId),
  );
  return sortedPlayers[0].playerId === playerId;
};

export default function GamePage() {
  const { playerId, name } = useAuth();
  const params = useParams();
  const roomId = typeof params.id === "string" ? params.id : "";
  const { setChannel, updatePlayerStats, player, room, channel } = useRoom();
  const mounted = useMounted();
  const { isUserValid } = useUserValid();
  const { setShowNameDialog } = useNameDialog();
  const { setCurrentQuestionHash, currentQuestionHash, questionList } =
    useQuestion();
  const { showAnswer } = useShowAnswer();
  const { players } = useRoomPlayers(channel);
  const [hasJoinedGame, setHasJoinedGame] = useState(false);
  const [joinedQuestionHash, setJoinedQuestionHash] = useState<string | null>(
    null,
  );
  const playerInputContainerRef = useRef<HTMLDivElement | null>(null);
  const isRequestingNewQuestionRef = useRef(false);
  const lastTriggeredNewQuestionKeyRef = useRef<string | null>(null);
  const lastSeenQuestionHashRef = useRef<string | null>(null);
  const wasShowingAnswerRef = useRef(false);
  const initializedPlayerKeyRef = useRef<string | null>(null);
  const { sendReqSync } = useDataSyncManager();
  const hasRequestedSyncRef = useRef(false);
  // initialize channel
  useLastChat();
  useRoomEvent();
  usePlayerStatsUpdater(hasJoinedGame);
  useRoomInitializer();

  // initialize player stats and enter channel
  useEffect(() => {
    if (!isUserValid) {
      setShowNameDialog(true);
    } else {
      setShowNameDialog(false);
    }
  }, [mounted, isUserValid]);

  // initialize ably channel and presence
  useEffect(() => {
    if (!mounted) return;
    const ch = initAbly({ roomId, playerId });
    setChannel(ch);
    return () => {
      leaveRoom();
    };
  }, [mounted]);

  // initialize player score only once per room/player
  useEffect(() => {
    if (!room) return;

    const initKey = `${room.id}:${playerId}`;
    if (initializedPlayerKeyRef.current === initKey) return;
    initializedPlayerKeyRef.current = initKey;

    const scores = room?.scores?.[playerId];
    updatePlayerStats({
      name: name,
      playerId: playerId,
      score: scores || 0,
      lastChat: "",
      playerStatus: PlayerStatus.waiting,
      fetchedStatus: FetchedStatus.fetching,
    });
  }, [name, playerId, room, updatePlayerStats]);

  // initialize current question when room/question list is loaded
  useEffect(() => {
    if (!room) return;

    const sourceQuestionList =
      questionList.length > 0 ? questionList : (room.questionList ?? []);
    if (sourceQuestionList.length === 0) return;

    const hasValidCurrentQuestion =
      !!currentQuestionHash &&
      sourceQuestionList.some((q) => q.hash === currentQuestionHash.hash);

    // only initialize once (or recover if current question is no longer valid)
    if (!hasValidCurrentQuestion) {
      setCurrentQuestionHash(sourceQuestionList[0] || null);
    }
  }, [room, questionList, setCurrentQuestionHash]);

  useEffect(() => {
    if (!hasJoinedGame) {
      hasRequestedSyncRef.current = false;
    }
  }, [hasJoinedGame]);

  useEffect(() => {
    if (!channel || !player || !hasJoinedGame || hasRequestedSyncRef.current)
      return;
    hasRequestedSyncRef.current = true;
    sendReqSync();
  }, [channel, hasJoinedGame, player, sendReqSync]);

  useEffect(() => {
    if (currentQuestionHash?.hash) {
      lastSeenQuestionHashRef.current = currentQuestionHash.hash;
    }
  }, [currentQuestionHash?.hash]);

  useEffect(() => {
    const currentHash = currentQuestionHash?.hash;
    const completedQuestionHash =
      currentHash ?? lastSeenQuestionHashRef.current;
    const completedIndex = questionList.findIndex(
      (q) => q.hash === completedQuestionHash,
    );
    const hasJustFinishedLastQuestion =
      wasShowingAnswerRef.current &&
      !showAnswer &&
      questionList.length > 0 &&
      completedIndex === questionList.length - 1;
    const isHost = checkIsFirstPlayer(players, playerId);
    const roundKey = `${questionList[0]?.hash ?? "none"}:${completedQuestionHash ?? "none"}`;

    if (
      !hasJoinedGame ||
      !hasJustFinishedLastQuestion ||
      !isHost ||
      isRequestingNewQuestionRef.current ||
      lastTriggeredNewQuestionKeyRef.current === roundKey
    ) {
      wasShowingAnswerRef.current = showAnswer;
      return;
    }

    isRequestingNewQuestionRef.current = true;
    lastTriggeredNewQuestionKeyRef.current = roundKey;

    noticeServerNewQuestion(roomId)
      .catch(() => {
        lastTriggeredNewQuestionKeyRef.current = null;
      })
      .finally(() => {
        isRequestingNewQuestionRef.current = false;
      });

    wasShowingAnswerRef.current = showAnswer;
  }, [
    currentQuestionHash?.hash,
    hasJoinedGame,
    showAnswer,
    playerId,
    players,
    questionList,
    roomId,
  ]);

  useEffect(() => {
    const isBlockedForCurrentQuestion =
      hasJoinedGame &&
      !joinedQuestionHash &&
      currentQuestionHash?.hash === joinedQuestionHash;

    if (!hasJoinedGame || isBlockedForCurrentQuestion || showAnswer) return;

    const rafId = requestAnimationFrame(() => {
      const root = playerInputContainerRef.current;
      const inputEl = root?.querySelector<
        HTMLInputElement | HTMLTextAreaElement
      >(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), [contenteditable="true"]',
      );
      inputEl?.focus();
    });

    return () => cancelAnimationFrame(rafId);
  }, [
    currentQuestionHash?.hash,
    hasJoinedGame,
    joinedQuestionHash,
    showAnswer,
  ]);

  if (!channel) return <div>Loading...</div>;

  // const isGameReady = players.length >= 2;
  const isGameReady = true;

  const isBlockedForCurrentQuestion =
    hasJoinedGame &&
    !!joinedQuestionHash &&
    currentQuestionHash?.hash === joinedQuestionHash;

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
    <div className="flex h-full w-full">
      {showAnswer ? (
        <ShowAnswer />
      ) : (
        <section className="flex-3">
          <header className="flex h-12 w-full items-center justify-between bg-gray-200 px-3">
            <TimerBar />
            {!hasJoinedGame ? (
              <button
                className="rounded bg-black px-3 py-1 text-white"
                onClick={handleJoinGame}
                disabled={!player}
              >
                Join game
              </button>
            ) : (
              <h1>
                {isGameReady
                  ? "Game started"
                  : "Waiting for 2 players to start"}
              </h1>
            )}
          </header>
          <main className="h-[calc(100%-6rem)] bg-red-200">
            {!hasJoinedGame ? (
              <div className="flex h-full items-center justify-center">
                Click "Join game" to join room and show yourself in player list.
              </div>
            ) : !isGameReady ? (
              <div className="flex h-full items-center justify-center">
                Waiting for one more player to join.
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

      <PlayerListChat />
    </div>
  );
}
