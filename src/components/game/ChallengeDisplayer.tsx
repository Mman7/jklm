import useSWR from "swr";
import { PlayerStatus } from "@/src/types/enum/player_status";
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
  );

  useEffect(() => {
    if (data) {
      setCurrentQuestion(data);
    }
  }, [data, setCurrentQuestion]);

  useEffect(() => {
    setShowLoading(isLoading);
  }, [isLoading, setShowLoading]);

  useEffect(() => {
    // If player has fetched the question, update status to fetched
    if (isLoading || !data || !player) return;
    if (player.status === PlayerStatus.fetched) return;

    updatePlayerStats({
      ...player,
      status: PlayerStatus.fetched,
    });
  }, [data, isLoading, player, updatePlayerStats]);

  if (!data)
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <h1 className="font-bold">Loading...</h1>
      </div>
    );

  if (data && data?.challenge.text !== null)
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <h1 className="mb-2 font-bold">{data?.challenge.prompt}</h1>
        <section className="rounded-2xl bg-gray-200 p-6">
          <q>{data?.challenge.text}</q>
        </section>
      </div>
    );
  else {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <h1 className="mb-2 text-xl font-bold">{data?.challenge.prompt}</h1>
        <h1>{data?.challenge.text}</h1>
        <figure className="rounded-2xl">
          {showPicture &&
            data?.challenge.image &&
            (data.challenge.image.type === "image/svg+xml" ? (
              <svg
                dangerouslySetInnerHTML={{
                  __html: atob(data.challenge.image.base64),
                }}
              />
            ) : (
              <img
                className="max-w-100"
                src={`data:${data.challenge.image.type};base64,${data.challenge.image.base64}`}
                alt={data?.details}
              />
            ))}
        </figure>
      </div>
    );
  }
}
