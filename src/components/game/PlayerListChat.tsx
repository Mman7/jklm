"use client";
import PlayerCard from "./PlayerCard";
import { useRoomPlayers } from "@/src/hooks/useRoomPlayers";
import useRoom from "@/src/zustands/useRoomStore";
import { Player } from "@/src/types/player";

export default function PlayerListChat() {
  const { channel } = useRoom();
  const { players } = useRoomPlayers(channel);

  return (
    <section className="border-base-content/10 bg-base-100/30 hidden w-48 flex-1 flex-col gap-3 border-l p-4 backdrop-blur-xl lg:flex">
      {players.map((p: Player, index) => (
        <PlayerCard key={index} player={p} />
      ))}
    </section>
  );
}
