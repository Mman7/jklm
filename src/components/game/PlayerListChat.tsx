"use client";
import PlayerCard from "./PlayerCard";
import { useRoomPlayers } from "@/src/hooks/useRoomPlayers";
import useRoom from "@/src/zustands/useRoomStore";
import { Player } from "@/src/types/player";
import { Users } from "lucide-react";

export default function PlayerListChat() {
  const { channel } = useRoom();
  const { players } = useRoomPlayers(channel);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <section className="border-base-content/10 bg-base-100 m-2 hidden w-56 flex-1 flex-col overflow-hidden rounded-2xl border-l lg:flex">
      <header className="border-base-content/5 bg-primary/10 flex h-12 items-center gap-2 border-b px-3">
        <Users size={14} className="text-primary" />
        <h2 className="text-sm font-semibold">
          Players ({sortedPlayers.length})
        </h2>
      </header>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
        {sortedPlayers.map((p: Player) => (
          <PlayerCard key={p.playerId} player={p} />
        ))}
      </div>
    </section>
  );
}
