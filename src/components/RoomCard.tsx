import { Room } from "@/src/app/types/room";
import useUserValid from "@/src/hooks/useUserValid";
import useNameDialog from "@/src/zustands/useNameDialogStore";
import { useRouter } from "next/navigation";
import useAuth from "../zustands/useAuthStore";

export default function RoomCard({ room }: { room: Room }) {
  const router = useRouter();
  const { setShowDialog } = useNameDialog();
  const { isUserValid } = useUserValid();
  const { token } = useAuth();

  const handleJoinRoom = () => {
    console.log(token);
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
      <h1>{room.hostId.split("-")[0]}'s Room</h1>
      <h1>{room.id}</h1>
    </div>
  );
}
