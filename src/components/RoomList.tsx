"use client";

import { useEffect, useState } from "react";
import { Room } from "../types/room";
import RoomCard from "./RoomCard";
import { getAllRooms } from "../library/client/client";

export default function RoomList() {
  // State to store the list of available rooms
  const [roomList, setRoomList] = useState<Room[]>([]);

  // Function to refresh the room list by fetching data from the API
  const handleRefreshList = async () => {
    const rooms = await getAllRooms();
    setRoomList(rooms);
  };

  // Effect to fetch room data when the component mounts
  useEffect(() => {
    void handleRefreshList();
  }, []);

  // Main render section for the room list
  return (
    <section className="flex h-full min-h-0 w-full flex-col p-4">
      {/* Header section with title and refresh button */}
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Join Public Room</h2>
        <button
          className="btn btn-sm btn-outline rounded-full hover:scale-105"
          onClick={handleRefreshList}
        >
          Refresh List
        </button>
      </div>

      {/* Scrollable container for room cards */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {/* Grid container for displaying room cards */}
        <div className="flex flex-wrap gap-4 px-4">
          {/* Conditional rendering: only show room cards if roomList has items */}
          {roomList.length > 0 &&
            roomList.map((room: Room) => (
              <RoomCard key={room.id} room={room} />
            ))}
        </div>
      </div>
    </section>
  );
}
