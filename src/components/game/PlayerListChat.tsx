"use client";
import PlayerCard from "./PlayerCard";
import { useRoomPlayers } from "@/src/hooks/useRoomPlayers";
import useRoom from "@/src/zustands/useRoomStore";
import { Player } from "@/src/types/player";

export default function PlayerListChat() {
  const { channel } = useRoom();
  const players = useRoomPlayers(channel);

  return (
    <section className="hidden w-48 flex-1 flex-col gap-3 bg-red-100 p-4 lg:flex">
      {players.map((p: Player, index) => (
        <PlayerCard key={index} player={p} />
      ))}
    </section>
  );
}
