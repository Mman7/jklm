import React from "react";

export default function RoomList() {
  return (
    <section className="h-full w-full bg-green-400 p-8 pt-4">
      <h2 className="mb-2 text-2xl font-semibold">Join Public Room</h2>
      <div className="flex flex-wrap justify-around gap-6 md:justify-start">
        <RoomCard />
        <RoomCard />
        <RoomCard />
        <RoomCard />
        <RoomCard />
        <RoomCard />
      </div>
    </section>
  );
}

function RoomCard() {
  return (
    <div className="min-w-2/12 rounded-lg bg-amber-300 p-4">
      <h1>Player1's Room</h1>
      <h3>Players: 2/4</h3>
      <h3>QPSL</h3>
    </div>
  );
}
