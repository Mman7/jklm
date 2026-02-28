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
    // Require a valid user profile before joining any room.
    if (!isUserValid) {
      setShowNameDialog(true);
      return;
    }

    // Show loading state while requesting latest room snapshot.
    setShowLoading(true);

    getRoom(room.id)
      .then((room: Room) => {
        // Room exists: cache it locally, then route to room page.
        setRoom(room);
        router.push(`/${room.id}`);
      })
      .catch((err) => {
        // Log fetch/join failures for debugging.
        console.log(err);
      });

    // Hide loading indicator after join request flow is triggered.
    setShowLoading(false);
  };

  return (
    <div
      onClick={handleJoinRoom}
      // Clickable card with subtle hover animation for room selection.
      className="group border-base-content/10 bg-base-100/60 hover:border-primary/40 hover:bg-base-100/80 min-w-2/12 cursor-pointer rounded-2xl border p-5 shadow-md backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:shadow-xl"
    >
      <h1 className="group-hover:text-primary mb-1 text-lg font-semibold">
        {room.hostId}'s Room
      </h1>
      <p className="text-sm opacity-70">{room.id}</p>
    </div>
  );
}
