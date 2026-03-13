"use client";

import { useEffect, useState } from "react";
import JoinDialog from "../components/dialogs/joinDialog";
import RoomList from "../components/RoomList";
import { useRouter } from "next/navigation";
import { getRoom, hostRoom } from "../library/client/client";
import useJoinDialog from "../hooks/useJoinDialog";
import { Room } from "../types/room";
import useUserValid from "../hooks/useUserValid";
import { useNameDialogStore } from "../zustands/useNameDialogStore";
import { useLoadingStore } from "../zustands/useLoadingStore";
import Dialog from "../components/dialogs/dialog";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRoomStore } from "../zustands/useRoomStore";
import { useAuthStore } from "../zustands/useAuthStore";
import { CircleHelp, PenLine, Users, Trophy, CirclePlus } from "lucide-react";

export default function Home() {
  const { openJoinDialog, setOpenJoinDialog, dialogCode, setDialogCode } =
    useJoinDialog();
  const router = useRouter();
  const [showNotFound, setNotFound] = useState(false);
  const { isUserValid } = useUserValid();
  const setShowNameDialog = useNameDialogStore((s) => s.setShowNameDialog);
  const setShowLoading = useLoadingStore((s) => s.setShowLoading);
  const playerId = useAuthStore((s) => s.playerId);
  const setRoom = useRoomStore((s) => s.setRoom);
  const channel = useRoomStore((s) => s.channel);

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
    <div className="relative flex h-full w-full flex-col gap-6 p-4 shadow-lg md:p-4">
      <section className="relative flex shrink-0 flex-col gap-8 overflow-hidden rounded-4xl border border-gray-200 bg-white shadow-md lg:flex-row lg:gap-12">
        {/* Left Content */}
        <div className="flex flex-1 flex-col justify-center gap-6 p-8">
          <div>
            <h1 className="mb-4 text-5xl leading-tight font-bold md:text-6xl">
              Welcome to <span className="text-primary underline">JKLM</span>
            </h1>
            <p className="text-base-content/80 mb-4 text-lg leading-relaxed">
              Play real-time trivia with friends, race for points, and win
              rounds by answering quickly and accurately.
            </p>
            <p className="text-base-content/70 text-base leading-relaxed">
              Create a room as host or join an existing room with a code.
            </p>
          </div>

          <section className="flex flex-col gap-3 pt-4">
            <button
              className="btn btn-primary btn-lg shadow-primary/50 rounded-full font-semibold shadow-md transition-all hover:scale-105 hover:shadow-lg"
              // Start host-room flow.
              onClick={() => handleHostRoom()}
            >
              <CirclePlus size={20} />
              Host Room
            </button>
            <button
              className="btn bg-secondary btn-lg rounded-full border border-gray-300 font-semibold shadow-xs transition-all hover:scale-105 hover:shadow-xl"
              // Open dialog to enter room code.
              onClick={() => setOpenJoinDialog(true)}
            >
              <Users className="text-primary mt-0.5 shrink-0" size={16} />
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
        <div className="flex flex-1">
          <div className="bg-primary text-primary-content p-8">
            {/* Decorative accent */}

            <h2 className="relative mb-4 flex items-center gap-3 text-3xl font-bold">
              <CircleHelp className="text-primary-content" size={28} />
              About JKLM
            </h2>
            <p className="text-primary-content/80 relative mb-6 leading-relaxed">
              JKLM is a multiplayer guessing game where each round reveals a new
              challenge. Every correct answer increases your score, and the
              first player to reach the target wins the round.
            </p>

            <h3 className="mb-4 text-xl font-semibold">How it works</h3>
            <ul className="text-primary-content/80 space-y-3">
              <li className="flex items-start gap-3">
                <CirclePlus
                  className="text-primary-content mt-1 shrink-0"
                  size={16}
                />
                <span>Host creates a room and shares the room code.</span>
              </li>
              <li className="flex items-start gap-3">
                <Users
                  className="text-primary-content mt-0.5 shrink-0"
                  size={16}
                />
                <span>Players join and wait for the question to start.</span>
              </li>
              <li className="flex items-start gap-3">
                <PenLine
                  className="text-primary-content mt-0.5 shrink-0"
                  size={16}
                />
                <span>
                  Submit answers in the input field as fast as possible.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Trophy
                  className="text-primary-content mt-0.5 shrink-0"
                  size={16}
                />
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
