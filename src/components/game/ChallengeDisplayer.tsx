import useSWR from "swr";
import { FetchedStatus } from "@/src/types/enum/player_status";
import useGame from "@/src/zustands/useGameStore";
import useLoadingDialog from "@/src/zustands/useLoadingStore";
import useQuestion from "@/src/zustands/useQuestionStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useEffect } from "react";
import { getQuestion } from "@/src/library/client/client";
import { Question } from "@/src/types/question";

export default function ChallengeDisplayer() {
  const { showPicture } = useGame();
  const { currentQuestionHash, setCurrentQuestion } = useQuestion();
  const { setShowLoading } = useLoadingDialog();
  const { updatePlayerStats, player } = useRoom();

  const { data, isLoading } = useSWR<Question>(
    currentQuestionHash,
    getQuestion,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useEffect(() => {
    if (data) {
      setCurrentQuestion(data);
      console.log(data);
    }
  }, [data, setCurrentQuestion]);

  useEffect(() => {
    setShowLoading(isLoading);
  }, [isLoading, setShowLoading]);

  useEffect(() => {
    // If player has fetched the question, update status to fetched
    if (isLoading || !data || !player) return;
    if (player.fetchedStatus === FetchedStatus.fetched) return;

    updatePlayerStats({
      ...player,
      fetchedStatus: FetchedStatus.fetched,
    });
  }, [data, isLoading, player, updatePlayerStats]);

  if (!data)
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <h1 className="font-bold">Loading...</h1>
      </div>
    );

  const hasText = !!data.challenge.text;
  const hasImage = !!data.challenge.image;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
      <h1 className="mb-2 text-xl font-bold">{data.challenge.prompt}</h1>

      {hasText && (
        <section className="rounded-2xl bg-gray-200 p-6">
          <q>{data.challenge.text}</q>
        </section>
      )}

      {hasImage && showPicture && (
        <figure className="rounded-2xl">
          {data.challenge.image!.type === "image/svg+xml" ? (
            <svg
              dangerouslySetInnerHTML={{
                __html: atob(data.challenge.image!.base64),
              }}
            />
          ) : (
            <img
              className="max-w-full"
              src={`data:${data.challenge.image!.type};base64,${data.challenge.image!.base64}`}
              alt={data.details}
            />
          )}
        </figure>
      )}

      {hasImage && !showPicture && (
        <p className="text-sm text-gray-600">
          Image will appear when all players are ready.
        </p>
      )}
    </div>
  );
}
