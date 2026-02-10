import PlayerCard from "@/src/components/game/PlayerCard";

export default function GamePage() {
  return (
    <div className="flex h-full w-full">
      <section className="flex-3">
        <header className="flex h-12 w-full items-center justify-center bg-gray-200">
          <h1>Status Waiting bar</h1>
        </header>
        <main className="h-[calc(100%-6rem)] bg-red-200">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <figure className="">Image</figure>
            <h1>WHat is this</h1>
          </div>
          <footer className="-mt-6 flex h-12 w-full items-center bg-gray-300 p-4">
            Text
          </footer>
        </main>
      </section>
      <section className="hidden w-48 flex-1 bg-red-100 p-4 xl:block">
        <PlayerCard />
      </section>
    </div>
  );
}
