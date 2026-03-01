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

    // Let React paint loading state before starting async work.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );

    try {
      const roomData: Room = await getRoom(room.id);

      // Room exists: cache it locally, then route to room page.
      setRoom(roomData);
      router.push(`/${roomData.id}`);
    } catch (err) {
      // Log fetch/join failures for debugging.
      console.log(err);
    } finally {
      // Hide loading indicator after join request flow completes.
      setShowLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleJoinRoom}
      // Clickable card with elevated visual hierarchy and richer hover effects.
      className="group border-base-content/10 bg-base-100/70 hover:border-primary/50 hover:bg-base-100 min-w-2/12 cursor-pointer overflow-hidden rounded-2xl border p-5 text-left shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="from-primary/10 to-secondary/10 pointer-events-none absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/15 text-primary grid h-10 w-10 place-items-center rounded-full text-sm font-bold">
            {room.hostId.split("-")[0][0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="group-hover:text-primary text-lg font-semibold transition-colors duration-300">
              {room.hostId.split("-")[0]}'s Room
            </h1>
            <p className="text-base-content/70 text-xs">Ready to join</p>
          </div>
        </div>
        <span className="badge badge-primary badge-outline ml-2">In-Game</span>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between">
        <p className="bg-base-200/70 text-base-content/75 rounded-lg px-2 py-1 text-xs font-medium">
          {room.id}
        </p>
        <span className="text-base-content/60 group-hover:text-primary text-sm transition-colors duration-300">
          Join →
        </span>
      </div>
    </button>
  );
}
