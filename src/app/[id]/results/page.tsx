import { getRoomById } from "@/src/library/server/database";

const getWinnerFromScores = (scores?: Record<string, number>) => {
  if (!scores) return null;

  const scoreEntries = Object.entries(scores);
  if (scoreEntries.length === 0) return null;

  scoreEntries.sort((a, b) => b[1] - a[1]);
  return scoreEntries[0][0] || null;
};

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ winner?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const room = await getRoomById(resolvedParams.id);
  const winnerFromQuery = resolvedSearchParams?.winner;
  const winnerFromScores = getWinnerFromScores(room?.scores);
  const winner = winnerFromQuery || winnerFromScores || "No winner yet";

  return (
    <main className="flex h-full w-full items-center justify-center">
      <section className="rounded-xl bg-gray-200 p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">Winner</h1>
        <p>{winner}</p>
      </section>
    </main>
  );
}
