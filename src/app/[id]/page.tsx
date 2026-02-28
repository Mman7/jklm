"use client";

import ChallengeDisplayer from "@/src/components/game/ChallengeDisplayer";
import GameJoinStatus from "@/src/components/game/GameJoinStatus";
import PlayerListChat from "@/src/components/game/PlayerListChat";
import PlayerInput from "@/src/components/PlayerInput";
import TimerBar from "@/src/components/Timer";
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
import useAuth from "@/src/zustands/useAuthStore";
import useQuestion from "@/src/zustands/useQuestionStore";
import useNameDialog from "@/src/zustands/useNameDialogStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useParams } from "next/navigation";
import { useState } from "react";
import useRoomInitializer from "@/src/hooks/useRoomInitializer";
import useShowAnswer from "@/src/zustands/useShowAnswerStore";
import ShowAnswer from "@/src/components/ShowAnswer";
import { useRoomPlayers } from "@/src/hooks/useRoomPlayers";

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
  const { sendReqSync } = useDataSyncManager();
  const { playerInputContainerRef } = usePlayerInputAutoFocus({
    currentQuestionHash,
    hasJoinedGame,
    joinedQuestionHash,
    showAnswer,
  });

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
    <div className="bg-base-200/50 flex h-full w-full">
      {showAnswer ? (
        <ShowAnswer />
      ) : (
        <section className="flex-3">
          <header className="border-base-content/10 bg-base-100/80 flex h-14 w-full items-center justify-between border-b px-4 shadow-sm backdrop-blur-xl">
            <TimerBar />
            <GameJoinStatus
              hasJoinedGame={hasJoinedGame}
              isGameReady={isGameReady}
              canJoinGame={!!player}
              onJoinGame={handleJoinGame}
            />
          </header>
          <main className="bg-base-100/20 h-[calc(100%-6.5rem)]">
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

      <PlayerListChat />
    </div>
  );
}
