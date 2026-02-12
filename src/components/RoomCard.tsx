import { Room } from "@/src/types/room";
import useNameDialog from "@/src/zustands/useNameDialogStore";
import { useRouter } from "next/navigation";
import useUserValid from "../hooks/useUserValid";

export default function RoomCard({ room }: { room: Room }) {
  const router = useRouter();
  const { setShowDialog } = useNameDialog();
  const { isUserValid } = useUserValid();

  const handleJoinRoom = () => {
    if (!isUserValid) {
      setShowDialog(true);
      return;
    }
    router.push(`/${room.id}`);
  };

  return (
    <div
      onClick={handleJoinRoom}
      className="min-w-2/12 rounded-lg bg-amber-300 p-4 transition-all duration-200 hover:scale-105 hover:cursor-pointer hover:bg-amber-400"
    >
      <h1>{room.hostId}'s Room</h1>
      <h1>{room.id}</h1>
    </div>
  );
}
