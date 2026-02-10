"use client";

import { useState } from "react";
import JoinDialog from "../components/dialogs/joinDialog";
import RoomList from "../components/RoomList";
import { useRouter } from "next/navigation";
import { getRoom, hostRoom } from "../library/client/client";
import useJoinDialog from "../hooks/useJoinDialog";
import { Room } from "./types/room";

export default function Home() {
  const { openJoinDialog, setOpenJoinDialog, dialogCode, setDialogCode } =
    useJoinDialog();
  const router = useRouter();
  const handleHostRoom = () => {
    hostRoom().then((room: Room) => router.push(`/${room.id}`));
  };

  const handleJoinRoom = () => {
    getRoom(dialogCode)
      .then((roomData: Room) => {
        // room found, navigate to room
        router.push(`/${roomData.id}`);
      })
      .catch((err) => {
        // handle room not found
        console.error(err);
      });
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
              setOpen={() => setOpenJoinDialog(false)}
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
    </div>
  );
}
