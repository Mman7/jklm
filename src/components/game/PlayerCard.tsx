import { PlayerStatus } from "@/src/types/enum/player_status";
import { Player } from "@/src/types/player";
import useAuth from "@/src/zustands/useAuthStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useEffect, useState } from "react";

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const { lastChat } = useRoom();
  const { playerId } = useAuth();
  const [lastMessage, setLastMessage] = useState("");

  useEffect(() => {
    if (lastChat.senderId === player.playerId) {
      setLastMessage(lastChat.message);
    }
  }, [lastChat]);

  return (
    <div
      className={`border-base-content/10 bg-base-100/60 flex flex-row gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all ${player.playerId === playerId && "border-primary/50 bg-primary/10 ring-primary/20 ring-2"}`}
    >
      <div className="avatar flex-1">
        <div className="indicator overflow-visible">
          <span className="indicator-item indicator-bottom indicator-center badge badge-primary z-10 shadow-md">
            {player.score}
          </span>
          {/* This wrapper controls the round shape */}
          <div className="ring-base-content/20 h-20 w-20 overflow-hidden rounded-full ring-2">
            <img
              src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
      <section className="relative flex-2 overflow-hidden">
        <h2 className="text-lg font-bold">{player.name}</h2>
        <p className="line-clamp-3 overflow-hidden font-black text-ellipsis text-gray-500">
          {player.playerStatus === PlayerStatus.answer_correct
            ? "CORRECTED✅"
            : lastMessage}
        </p>
      </section>
    </div>
  );
}
