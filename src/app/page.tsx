"use client";

import { useEffect, useState } from "react";
import JoinDialog from "../components/dialogs/joinDialog";
import RoomList from "../components/RoomList";
import { useRouter } from "next/navigation";
import { getRoom, hostRoom } from "../library/client/client";
import useJoinDialog from "../hooks/useJoinDialog";
import { Room } from "../types/room";
import useUserValid from "../hooks/useUserValid";
import useNameDialog from "../zustands/useNameDialogStore";
import useLoadingDialog from "../zustands/useLoadingStore";
import Dialog from "../components/dialogs/dialog";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import useRoom from "../zustands/useRoomStore";
import useAuth from "../zustands/useAuthStore";

export default function Home() {
  const { openJoinDialog, setOpenJoinDialog, dialogCode, setDialogCode } =
    useJoinDialog();
  const router = useRouter();
  const [showNotFound, setNotFound] = useState(false);
  const { isUserValid } = useUserValid();
  const { setShowNameDialog } = useNameDialog();
  const { setShowLoading } = useLoadingDialog();
  const { playerId } = useAuth();
  const { setRoom, channel } = useRoom();

  useEffect(() => {
    //* TODO temporaly fix user back and forward page cause bug
    if (channel) location.reload();
  }, [channel]);

  const handleHostRoom = async () => {
    if (!isUserValid) {
      setShowNameDialog(true);
      return;
    }
    setShowLoading(true);

    await hostRoom({ playerId }).then((room: Room) => {
      router.push(`/${room.id}`);
      setRoom(room);
    });
    setShowLoading(false);
  };

  const handleJoinRoom = async () => {
    if (!isUserValid) {
      setShowNameDialog(true);
      return;
    }
    setShowLoading(true);

    await getRoom(dialogCode)
      .then((room: Room) => {
        // room found, navigate to room
        setRoom(room);
        router.push(`/${room.id}`);
      })
      .catch(() => {
        // handle room not found
        setNotFound(true);
      });

    setShowLoading(false);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 p-6 pb-0">
      <section className="bg-red flex h-full w-full gap-4">
        <div className="flex flex-1 flex-col">
          <h1 className="mb-4 text-4xl font-bold">Welcome to JKLM</h1>
          <section className="flex flex-col">
            <button
              className="btn btn-primary my-2"
              onClick={() => handleHostRoom()}
            >
              Host Room
            </button>
            <button
              className="btn btn-secondary my-2"
              onClick={() => setOpenJoinDialog(true)}
            >
              Join Room
            </button>
            <JoinDialog
              open={openJoinDialog}
              setClose={() => setOpenJoinDialog(false)}
              setDialogCode={setDialogCode}
              dialogCode={dialogCode}
              callback={handleJoinRoom}
            />
          </section>
        </div>
        <div className="w-full flex-1 bg-red-400 p-4">
          <h2 className="mb-2 text-2xl font-semibold">About JKLM</h2>
        </div>
      </section>
      <RoomList />
      <Dialog
        open={showNotFound}
        className="w-xs"
        onClose={() => setNotFound(false)}
      >
        <DotLottieReact
          src="/lotties/not_found.lottie"
          className="aspect-square"
          loop
          autoplay
        />
        <h1 className="text-center text-lg font-medium">Room not found</h1>
      </Dialog>
    </div>
  );
}
