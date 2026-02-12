import { Player } from "@/src/types/player";

interface PlayerCardProps {
  player: Player;
  lastChat?: string;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="flex flex-row gap-1 rounded-lg bg-white p-3 shadow-md">
      <div className="avatar flex-1">
        <div className="size-20 rounded-full">
          <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
        </div>
      </div>
      <section className="flex-2">
        <h2 className="text-lg font-bold">{player.name}</h2>
        <p className="text-gray-600">{player.score}</p>
        <p className="font-black text-gray-500">{player.lastChat}</p>
      </section>
    </div>
  );
}
