"use client";

import PlayerListChat from "@/src/components/game/PlayerListChat";
import useMounted from "@/src/hooks/useMounted";
import {
  enterChannel,
  initAbly,
  sendMessage,
  subscribeToMessages,
} from "@/src/library/client/ably_client";
import { Status } from "@/src/types/enum/player_status";
import useGame from "@/src/zustands/useGameStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function GamePage() {
  const params = useParams();
  const { playerId, name } = useGame();
  const { setChannel, channel, setRoomId, updatePlayerStats, player } =
    useRoom();
  const mounted = useMounted();
  const roomId = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    if (!mounted) return;
    const ch = initAbly({ roomId, playerId });
    setChannel(ch);
    setRoomId(roomId);

    updatePlayerStats({
      name: name,
      playerId: playerId,
      score: player.score,
      lastChat: "fuck",
      status: Status.waiting,
    });

    subscribeToMessages((msg) => {
      console.log("New message:", msg.text);
    });

    sendMessage("fuck");

    return () => {
      channel?.unsubscribe();
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
          <footer className="-mt-6 flex h-12 w-full items-center bg-gray-300 p-4">
            Text
          </footer>
        </main>
      </section>
      <PlayerListChat />
    </div>
  );
}
