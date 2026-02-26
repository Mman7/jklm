import { useLastChat } from "@/src/hooks/useLastChat";
import { PlayerStatus } from "@/src/types/enum/player_status";
import { Player } from "@/src/types/player";
import useAuth from "@/src/zustands/useAuthStore";
import { useEffect, useState } from "react";

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const { lastChat } = useLastChat();
  const { playerId } = useAuth();
  const [lastMessage, setLastMessage] = useState("");

  useEffect(() => {
    if (lastChat.senderId === player.playerId) {
      setLastMessage(lastChat.message);
    }
  }, [lastChat]);

  return (
    <div
      className={`flex flex-row gap-1 rounded-lg bg-white ${player.playerId === playerId && "bg-green-300!"} p-3 shadow-md`}
    >
      <div className="avatar flex-1">
        <div className="indicator overflow-visible">
          <span className="indicator-item indicator-bottom indicator-center badge badge-primary z-10">
            {player.score}
          </span>
          {/* This wrapper controls the round shape */}
          <div className="h-20 w-20 overflow-hidden rounded-full">
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
