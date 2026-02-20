"use client";

import ChallengeDisplayer from "@/src/components/game/ChallengeDisplayer";
import PlayerListChat from "@/src/components/game/PlayerListChat";
import PlayerInput from "@/src/components/PlayerInput";
import { useLastChat } from "@/src/hooks/useLastChat";
import useMounted from "@/src/hooks/useMounted";
import useUserValid from "@/src/hooks/useUserValid";
import {
  enterChannel,
  initAbly,
  leaveRoom,
} from "@/src/library/client/ably_client";
import { getRoom } from "@/src/library/client/client";
import { Status } from "@/src/types/enum/player_status";
import useAuth from "@/src/zustands/useAuthStore";
import useGame from "@/src/zustands/useGameStore";
import useLoadingDialog from "@/src/zustands/useLoadingStore";
import useNameDialog from "@/src/zustands/useNameDialogStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useEffectEvent } from "react";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { playerId, name } = useAuth();
  const { setChannel, updatePlayerStats, setRoom, player, room } = useRoom();
  const mounted = useMounted();
  const roomId = typeof params.id === "string" ? params.id : "";
  const { isUserValid } = useUserValid();
  const { setShowNameDialog } = useNameDialog();
  const { setShowLoading } = useLoadingDialog();
  const { setQuestionList } = useGame();
  const { setCurrentQuestion } = useGame();
  // initialize channel
  useLastChat();

  // TODO when start game fetch question and update question state, also update player status to playing

  useEffect(() => {
    const loadRoom = async () => {
      if (!isUserValid) {
        setShowNameDialog(true);
        return;
      }
      setShowLoading(true);
      try {
        await getRoom(roomId).then((res) => {
          setRoom(res);
          setQuestionList(res?.questionList || []);
        });
      } catch {
        // handle room not found
        router.push("/");
      } finally {
        setShowLoading(false);
      }
    };
    loadRoom();
  }, [mounted, isUserValid]);

  useEffect(() => {
    if (!mounted) return;
    const ch = initAbly({ roomId, playerId });
    setChannel(ch);
    updatePlayerStats({
      name: name,
      playerId: playerId,
      score: 0,
      lastChat: "",
      status: Status.waiting,
    });
    return () => {
      leaveRoom();
    };
  }, [mounted]);

  useEffect(() => {
    enterChannel(player);
  }, [player]);

  useEffect(() => {
    if (!room || !room.questionList) return;
    setCurrentQuestion(room.questionList[0] || null);
  }, [room]);

  return (
    <div className="flex h-full w-full">
      <section className="flex-3">
        <header className="flex h-12 w-full items-center justify-center bg-gray-200">
          <h1>Status Waiting bar</h1>
        </header>
        <main className="h-[calc(100%-6rem)] bg-red-200">
          <ChallengeDisplayer />
          <PlayerInput />
        </main>
      </section>
      <PlayerListChat />
    </div>
  );
}
