"use client";

import ChallengeDisplayer from "@/src/components/game/ChallengeDisplayer";
import PlayerListChat from "@/src/components/game/PlayerListChat";
import PlayerInput from "@/src/components/PlayerInput";
import TimerBar from "@/src/components/Timer";
import { useLastChat } from "@/src/hooks/useLastChat";
import useMounted from "@/src/hooks/useMounted";
import useRoomEvent from "@/src/hooks/useRoomEvent";
import useUserValid from "@/src/hooks/useUserValid";
import {
  enterChannel,
  initAbly,
  leaveRoom,
} from "@/src/library/client/ably_client";
import { PlayerStatus } from "@/src/types/enum/player_status";
import useAuth from "@/src/zustands/useAuthStore";
import useQuestion from "@/src/zustands/useQuestionStore";
import useNameDialog from "@/src/zustands/useNameDialogStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  const { setCurrentQuestionHash, currentIndexInList, questionList } =
    useQuestion();
  const { showAnswer } = useShowAnswer();
  const { players } = useRoomPlayers(channel);
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading } = useSWR(enabled ? "/api/user" : null, () =>
    noticeServerNewQuestion(roomId),
  );
  // initialize channel
  useLastChat();
  useRoomEvent();
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
      status: PlayerStatus.waiting,
    });
    setCurrentQuestionHash(room.questionList[0] || null);
    //TODO request sync data when room info is loaded, to make sure all player have the same question and timer
    // sendReqSync();
  }, [room]);

  useEffect(() => {
    if (player) enterChannel(player);
  }, [player]);

  useEffect(() => {
    if (isLoading) return;
    // check is last question, if yes fetch new question list
    if (currentIndexInList === questionList.length - 1) {
      // fetch new question list
      if (checkIsFirstPlayer(players, playerId)) {
        setEnabled(true);
      }
    }
  }, [currentIndexInList]);

  if (!channel) return <div>Loading...</div>;

  return (
    <div className="flex h-full w-full">
      {showAnswer ? (
        <ShowAnswer />
      ) : (
        <section className="flex-3">
          <header className="flex h-12 w-full flex-col items-center justify-center bg-gray-200">
            <TimerBar />
            <h1>Status Waiting bar</h1>
          </header>
          <main className="h-[calc(100%-6rem)] bg-red-200">
            <ChallengeDisplayer />
            <PlayerInput />
          </main>
        </section>
      )}

      <PlayerListChat />
    </div>
  );
}
