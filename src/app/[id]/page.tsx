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
import useSWR from "swr";

const checkIsFirstPlayer = (players: any[], playerId: string) => {
  if (players.length === 0) return false;
  const sortedPlayers = [...players].sort((a, b) => a.joinedAt - b.joinedAt);
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
  const [enabled, setEnabled] = useState(false);
  const [hasJoinedGame, setHasJoinedGame] = useState(false);
  const { sendReqSync } = useDataSyncManager();
  const hasRequestedSyncRef = useRef(false);
  const { isLoading } = useSWR(
    enabled ? "newQuestion" : null,
    () => noticeServerNewQuestion(roomId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
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

  // initialize player stats and set current question when room info is loaded
  useEffect(() => {
    if (!room || !room.questionList) return;
    const scores = room?.scores?.[playerId];
    updatePlayerStats({
      name: name,
      playerId: playerId,
      score: scores || 0,
      lastChat: "",
      playerStatus: PlayerStatus.waiting,
      fetchedStatus: FetchedStatus.fetching,
    });
    setCurrentQuestionHash(room.questionList[0] || null);
  }, [name, playerId, room, setCurrentQuestionHash, updatePlayerStats]);

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
    if (isLoading) return;

    const currentIndex = questionList.findIndex(
      (q) => q.hash === currentQuestionHash?.hash,
    );
    const isLastQuestion =
      questionList.length > 0 && currentIndex === questionList.length - 1;

    if (isLastQuestion && checkIsFirstPlayer(players, playerId)) {
      setEnabled(true);
      return;
    }

    setEnabled(false);
  }, [currentQuestionHash, isLoading, playerId, players, questionList]);

  if (!channel) return <div>Loading...</div>;

  const isGameReady = players.length >= 2;

  const handleJoinGame = () => {
    if (!player || hasJoinedGame) return;
    enterChannel(player);
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
                <PlayerInput />
              </>
            )}
          </main>
        </section>
      )}

      <PlayerListChat />
    </div>
  );
}
