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
    <section className="h-full w-full bg-green-400 p-8 pt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Join Public Room</h2>
        <button className="btn btn-sm btn-outline" onClick={handleRefreshList}>
          Refresh List
        </button>
      </div>
      <div className="flex flex-wrap justify-around gap-6 sm:justify-start">
        {roomList.length > 0 &&
          roomList.map((room: Room) => <RoomCard key={room.id} room={room} />)}
      </div>
    </section>
  );
}
