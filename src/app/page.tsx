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
    // Reset stale client state if an old channel instance leaks into home.
    if (channel) location.reload();
  }, [channel]);

  const handleHostRoom = async () => {
    // Name/profile must exist before creating a room.
    if (!isUserValid) {
      setShowNameDialog(true);
      return;
    }

    // Show global loading while creating room on backend.
    setShowLoading(true);

    await hostRoom({ playerId }).then((room: Room) => {
      // Persist room in store, then navigate to room route.
      router.push(`/${room.id}`);
      setRoom(room);
    });

    // End loading state after host flow settles.
    setShowLoading(false);
  };

  const handleJoinRoom = async () => {
    // Require valid user identity before joining.
    if (!isUserValid) {
      setShowNameDialog(true);
      return;
    }

    // Show loading while validating room code with server.
    setShowLoading(true);

    await getRoom(dialogCode)
      .then((room: Room) => {
        // Room exists: cache and navigate.
        setRoom(room);
        router.push(`/${room.id}`);
      })
      .catch(() => {
        // Invalid code: open not-found dialog.
        setNotFound(true);
      });

    // Hide loading spinner regardless of join result.
    setShowLoading(false);
  };

  return (
    <div className="relative flex h-full w-full flex-col gap-6 p-6 md:p-12">
      {/* Decorative dots pattern - subtle overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      <section className="relative flex shrink-0 flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Left Content */}
        <div className="flex flex-1 flex-col justify-center gap-6">
          <div>
            <h1 className="mb-4 text-5xl leading-tight font-bold md:text-6xl">
              Welcome to <span className="text-primary">JKLM</span>
            </h1>
            <p className="text-base-content/80 mb-4 text-lg leading-relaxed">
              Play real-time trivia with friends, race for points, and win
              rounds by answering quickly and accurately.
            </p>
            <p className="text-base-content/70 text-base leading-relaxed">
              Create a room as host or join an existing room with a code.
            </p>
          </div>

          <section className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              className="btn btn-primary btn-lg rounded-full font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              // Start host-room flow.
              onClick={() => handleHostRoom()}
            >
              Host Room
            </button>
            <button
              className="btn btn-secondary btn-lg rounded-full font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              // Open dialog to enter room code.
              onClick={() => setOpenJoinDialog(true)}
            >
              Join Room
            </button>
            <JoinDialog
              // Controlled dialog for room-code join flow.
              open={openJoinDialog}
              setClose={() => setOpenJoinDialog(false)}
              setDialogCode={setDialogCode}
              dialogCode={dialogCode}
              callback={handleJoinRoom}
            />
          </section>
        </div>

        {/* Right Content */}
        <div className="flex flex-1 flex-col gap-8">
          <div className="border-base-content/10 from-primary/10 to-secondary/10 relative overflow-hidden rounded-2xl border bg-linear-to-br p-8 backdrop-blur-sm">
            {/* Decorative accent */}
            <div className="bg-primary/10 pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full blur-2xl"></div>

            <h2 className="relative mb-4 text-3xl font-bold">About JKLM</h2>
            <p className="text-base-content/80 relative mb-6 leading-relaxed">
              JKLM is a multiplayer guessing game where each round reveals a new
              challenge. Every correct answer increases your score, and the
              first player to reach the target wins the round.
            </p>

            <h3 className="mb-4 text-xl font-semibold">How it works</h3>
            <ul className="text-base-content/80 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary">▸</span>
                <span>Host creates a room and shares the room code.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">▸</span>
                <span>Players join and wait for the question to start.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">▸</span>
                <span>
                  Submit answers in the input field as fast as possible.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">▸</span>
                <span>Scores update live for everyone in the room.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}

      <div className="min-h-0 flex-1">
        {/* Live list of available rooms. */}
        <RoomList />
      </div>

      <Dialog
        // Modal shown when entered room code is not found.
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
        <h1 className="text-center text-lg font-semibold">Room not found</h1>
      </Dialog>
    </div>
  );
}
