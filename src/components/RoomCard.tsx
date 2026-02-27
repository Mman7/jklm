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
      className="group border-base-content/10 bg-base-100/60 hover:border-primary/40 hover:bg-base-100/80 min-w-2/12 cursor-pointer rounded-2xl border p-5 shadow-md backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:shadow-xl"
    >
      <h1 className="group-hover:text-primary mb-1 text-lg font-semibold">
        {room.hostId}'s Room
      </h1>
      <p className="text-sm opacity-70">{room.id}</p>
    </div>
  );
}
