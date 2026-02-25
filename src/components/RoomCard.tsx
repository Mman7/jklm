import { Room } from "@/src/types/room";
import useNameDialog from "@/src/zustands/useNameDialogStore";
import { useRouter } from "next/navigation";
import useUserValid from "../hooks/useUserValid";
import { getRoom } from "../library/client/client";
import useLoadingDialog from "../zustands/useLoadingStore";
import useRoom from "../zustands/useRoomStore";

export default function RoomCard({ room }: { room: Room }) {
  const router = useRouter();
  const { setShowNameDialog } = useNameDialog();
  const { setShowLoading } = useLoadingDialog();
  const { setRoom } = useRoom();
  const { isUserValid } = useUserValid();

  const handleJoinRoom = async () => {
    if (!isUserValid) {
      setShowNameDialog(true);
      return;
    }
    setShowLoading(true);

    getRoom(room.id)
      .then((room: Room) => {
        // room found, navigate to room
        setRoom(room);
        router.push(`/${room.id}`);
      })
      .catch((err) => {
        console.log(err);
      });

    setShowLoading(false);
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
