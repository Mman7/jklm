"use client";

import { useEffect, useState } from "react";
import { Room } from "../types/room";
import RoomCard from "./RoomCard";
import { getAllRooms } from "../library/client/client";

export default function RoomList() {
  const [roomList, setRoomList] = useState<Room[]>([]);

  const handleRefreshList = async () => {
    const rooms = await getAllRooms();
    setRoomList(rooms);
  };

  useEffect(() => {
    void handleRefreshList();
  }, []);

  return (
    <section className="flex h-full min-h-0 w-full flex-col p-4">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Join Public Room</h2>
        <button
          className="btn btn-sm btn-outline rounded-full hover:scale-105"
          onClick={handleRefreshList}
        >
          Refresh List
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-wrap justify-around gap-4 px-4 sm:justify-start">
          {roomList.length > 0 &&
            roomList.map((room: Room) => (
              <RoomCard key={room.id} room={room} />
            ))}
        </div>
      </div>
    </section>
  );
}
