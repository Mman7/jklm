"use client";

import PlayerListChat from "@/src/components/game/PlayerListChat";
import PlayerInput from "@/src/components/PlayerInput";
import { useLastChat } from "@/src/hooks/useLastChat";
import useMounted from "@/src/hooks/useMounted";
import {
  enterChannel,
  initAbly,
  leaveRoom,
} from "@/src/library/client/ably_client";
import { Status } from "@/src/types/enum/player_status";
import useAuth from "@/src/zustands/useAuthStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function GamePage() {
  const params = useParams();
  const { playerId, name } = useAuth();
  const { setChannel, updatePlayerStats, player } = useRoom();
  const mounted = useMounted();
  const roomId = typeof params.id === "string" ? params.id : "";
  // initialize channel
  useLastChat();

  useEffect(() => {
    if (!mounted) return;
    const ch = initAbly({ roomId, playerId });
    setChannel(ch);
    updatePlayerStats({
      name: name,
      playerId: playerId,
      score: player.score,
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

  return (
    <div className="flex h-full w-full">
      <section className="flex-3">
        <header className="flex h-12 w-full items-center justify-center bg-gray-200">
          <h1>Status Waiting bar</h1>
        </header>
        <main className="h-[calc(100%-6rem)] bg-red-200">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <figure className="">Image</figure>
            <h1>WHat is this</h1>
          </div>
          <PlayerInput />
        </main>
      </section>
      <PlayerListChat />
    </div>
  );
}
