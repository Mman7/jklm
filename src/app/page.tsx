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
        setRoom(room);
        router.push(`/${room.id}`);
      })
      .catch(() => {
        setNotFound(true);
      });

    setShowLoading(false);
  };

  return (
    <div className="relative flex h-full w-full flex-col gap-6 overflow-hidden p-6 md:p-12">
      {/* Decorative dots pattern - subtle overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      <section className="relative shrink-0 flex flex-col gap-8 lg:flex-row lg:gap-12">
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
              onClick={() => handleHostRoom()}
            >
              Host Room
            </button>
            <button
              className="btn btn-secondary btn-lg rounded-full font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
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

        {/* Right Content */}
        <div className="flex flex-1 flex-col gap-8">
          <div className="border-base-content/10 from-primary/10 to-secondary/10 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-8 backdrop-blur-sm">
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
      <section className="border-base-content/10 bg-base-100/50 relative shrink-0 rounded-2xl border p-8 backdrop-blur-sm">
        {/* Decorative circle */}
        <div className="bg-primary/5 pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full blur-2xl"></div>
        <div className="bg-secondary/5 pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full blur-2xl"></div>

        <h2 className="mb-8 text-3xl font-bold">Why play JKLM?</h2>
        <div className="relative grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h4 className="text-primary text-lg font-semibold">
              Real-time Gameplay
            </h4>
            <p className="text-base-content/70 leading-relaxed">
              Instant feedback and live competition that keeps everyone engaged.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-primary text-lg font-semibold">Simple Setup</h4>
            <p className="text-base-content/70 leading-relaxed">
              Host or join in just a few clicks, no complicated configurations.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-primary text-lg font-semibold">Fast Rounds</h4>
            <p className="text-base-content/70 leading-relaxed">
              Short, exciting sessions perfect for groups of any size.
            </p>
          </div>
        </div>
      </section>

      <div className="min-h-0 flex-1">
        <RoomList />
      </div>

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
        <h1 className="text-center text-lg font-semibold">Room not found</h1>
      </Dialog>
    </div>
  );
}
