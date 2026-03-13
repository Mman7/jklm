import { PlayerStatus } from "@/src/types/enum/player_status";
import { Player } from "@/src/types/player";
import { useLastChat } from "@/src/hooks/useLastChat";
import { useAuthStore } from "@/src/zustands/useAuthStore";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const playerId = useAuthStore((s) => s.playerId);
  const { lastChat } = useLastChat();
  const isAnswerCorrect = player.playerStatus === PlayerStatus.answer_correct;
  const isCurrentPlayer = player.playerId === playerId;
  const initials = player.name.trim().slice(0, 2).toUpperCase();
  const [playerChat, setPlayerChat] = useState("");

  useEffect(() => {
    if (lastChat.senderId === player.playerId) {
      setPlayerChat(lastChat.message);
    }
  }, [lastChat, player.playerId]);

  return (
    <div
      className={`border-base-content/10 relative flex items-center gap-3 rounded-xl border px-3 py-2.5 ${isCurrentPlayer ? "bg-primary/10 border-primary/30" : "bg-base-100"}`}
    >
      <div className="avatar indicator shrink-0">
        <span className="indicator-item indicator-bottom indicator-center badge badge-primary badge-sm text-[10px] font-semibold">
          {player.score.toLocaleString()} pts
        </span>
        <div className="bg-primary/15 text-primary flex size-11 items-center justify-center rounded-full text-xs font-bold">
          <h1 className="text-md">{initials}</h1>
        </div>
      </div>

      <section className="min-w-0 flex-1 p-2">
        <h2 className="truncate text-lg leading-tight font-semibold">
          {player.name}
        </h2>
        <pre
          className={`text-md truncate ${isAnswerCorrect ? "text-success font-semibold" : "text-base-content/60"}`}
        >
          {isAnswerCorrect ? "CORRECT" : playerChat || " "}
        </pre>
      </section>

      {isAnswerCorrect && <CheckCircle2 size={16} className="text-success" />}
    </div>
  );
}
