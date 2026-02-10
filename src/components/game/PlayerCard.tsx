import React from "react";

export default function PlayerCard() {
  return (
    <div className="flex flex-row rounded-lg bg-white p-4 shadow-md">
      <figure className="avatar flex-1 rounded-4xl">
        <div className="rounded-full bg-blue-200">x</div>
      </figure>
      <section className="flex-2">
        <h2 className="text-xl font-bold">Player Name</h2>
        <p className="text-gray-600">Score: 12345</p>
        <p className="font-black text-gray-500">last chat</p>
      </section>
    </div>
  );
}
