"use client";
import PlayerCard from "./PlayerCard";
import { useRoomPlayers } from "@/src/hooks/useRoomPlayers";
import { useRoomStore } from "@/src/zustands/useRoomStore";
import { Player } from "@/src/types/player";
import { Users } from "lucide-react";
import type { ReactNode } from "react";

interface PlayerListChatProps {
  className?: string;
  headerAction?: ReactNode;
}

export default function PlayerListChat({
  className,
  headerAction,
}: PlayerListChatProps) {
  const channel = useRoomStore((s) => s.channel);
  const { players } = useRoomPlayers(channel);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <section
      className={`border-base-content/10 bg-base-100 flex flex-1 flex-col overflow-hidden rounded-2xl border-l ${className ?? ""}`}
    >
      <header className="border-base-content/5 bg-primary/10 flex h-12 items-center gap-2 border-b px-3">
        <Users size={14} className="text-primary" />
        <h2 className="text-sm font-semibold">
          Players ({sortedPlayers.length})
        </h2>
        {headerAction ? (
          <div className="ml-auto flex items-center">{headerAction}</div>
        ) : null}
      </header>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
        {sortedPlayers.map((p: Player) => (
          <PlayerCard key={p.playerId} player={p} />
        ))}
      </div>
    </section>
  );
}
