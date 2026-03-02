import { PlayerStatus } from "@/src/types/enum/player_status";
import { Player } from "@/src/types/player";
import useAuth from "@/src/zustands/useAuthStore";
import useGame from "@/src/zustands/useGameStore";
import useRoom from "@/src/zustands/useRoomStore";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const { lastChat } = useRoom();
  const { timer } = useGame();
  const { playerId } = useAuth();
  const [lastMessage, setLastMessage] = useState("");
  const [answerTimeLeftMs, setAnswerTimeLeftMs] = useState<number | null>(null);

  useEffect(() => {
    if (lastChat.senderId === player.playerId) {
      setLastMessage(lastChat.message);
    }
  }, [lastChat]);

  useEffect(() => {
    if (player.playerStatus === PlayerStatus.answer_correct) {
      if (answerTimeLeftMs === null && timer !== null) {
        setAnswerTimeLeftMs(timer);
      }
      return;
    }

    if (answerTimeLeftMs !== null) {
      setAnswerTimeLeftMs(null);
    }
  }, [answerTimeLeftMs, player.playerStatus, timer]);

  const millisecondsLeft = answerTimeLeftMs;
  const elapsedMs =
    millisecondsLeft !== null ? Math.max(20_000 - millisecondsLeft, 0) : null;
  const elapsedSeconds =
    elapsedMs !== null ? Math.floor(elapsedMs / 1000) : null;
  const elapsedMilliseconds = elapsedMs !== null ? elapsedMs % 1000 : null;
  const isAnswerCorrect = player.playerStatus === PlayerStatus.answer_correct;

  return (
    <div
      className={`border-base-content/10 bg-base-100/60 relative flex flex-row gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all ${player.playerId === playerId && "border-primary/50 bg-primary/10 ring-primary/20 ring-2"} ${isAnswerCorrect && "border-success/60 bg-success/10 ring-success/25 shadow-success/30 scale-[1.02] ring-2"}`}
    >
      {isAnswerCorrect && (
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span className="bg-success relative inline-flex h-3 w-3 rounded-full" />
        </span>
      )}

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
        <p
          className={`line-clamp-3 overflow-hidden font-black text-ellipsis ${isAnswerCorrect ? "text-success flex animate-pulse items-center gap-2" : "text-gray-500"}`}
        >
          {isAnswerCorrect ? (
            <>
              <CheckCircle2 size={16} />
              CORRECT
            </>
          ) : (
            lastMessage
          )}
        </p>
        {isAnswerCorrect &&
          elapsedSeconds !== null &&
          elapsedMilliseconds !== null && (
            <h1 className="text-success mt-1 animate-pulse text-sm font-semibold">
              {elapsedSeconds}.{elapsedMilliseconds.toString().padStart(3, "0")}
              s
            </h1>
          )}
      </section>
    </div>
  );
}
