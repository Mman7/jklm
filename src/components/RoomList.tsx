"use client";

import { useEffect, useState } from "react";
import { Room } from "../app/types/room";
import RoomCard from "./RoomCard";

export default function RoomList() {
  const [roomList, setRoomList] = useState<Room[]>([]);
  useEffect(() => {
    fetch("/api/getall-room")
      .then((res) => res.json())
      .then((data) => setRoomList(data));
  }, []);

  return (
    <section className="h-full w-full bg-green-400 p-8 pt-4">
      <h2 className="mb-2 text-2xl font-semibold">Join Public Room</h2>
      <div className="flex flex-wrap justify-around gap-6 md:justify-start">
        {roomList.length > 0 &&
          roomList.map((room: Room) => <RoomCard key={room.id} room={room} />)}
      </div>
    </section>
  );
}
