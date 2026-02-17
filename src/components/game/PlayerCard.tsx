import { useLastChat } from "@/src/hooks/useLastChat";
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
        <div className="size-20 rounded-full">
          <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
        </div>
      </div>
      {/* //TODO fix text overflow */}
      <section className="relative flex-2">
        <h2 className="text-lg font-bold">{player.name}</h2>
        <p className="text-gray-600">{player.score}</p>
        <p className="line-clamp-3 truncate font-black text-gray-500">
          {lastMessage}
        </p>
      </section>
    </div>
  );
}
