import useSWR from "swr";
import { FetchedStatus } from "@/src/types/enum/player_status";
import useGame from "@/src/zustands/useGameStore";
import useLoadingDialog from "@/src/zustands/useLoadingStore";
import useQuestion from "@/src/zustands/useQuestionStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useEffect } from "react";
import { getQuestion } from "@/src/library/client/client";
import { Question } from "@/src/types/question";
import SvgBase64Image from "./SvgBase64Image";
import Base64Image from "./Base64Image";

export default function ChallengeDisplayer() {
  const { showPicture } = useGame();
  const { currentQuestionHash, setCurrentQuestion } = useQuestion();
  const { setShowLoading } = useLoadingDialog();
  const { updatePlayerStats, player } = useRoom();

  const { data, isLoading, error } = useSWR<Question>(
    currentQuestionHash,
    async (questionHash) => {
      const question = await getQuestion(questionHash);
      if (!question) {
        throw new Error("Question not found");
      }
      return question;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    if (data) {
      setCurrentQuestion(data);
      console.log(data);
    }
  }, [data, setCurrentQuestion]);

  useEffect(() => {
    setShowLoading(!!currentQuestionHash && isLoading && !error);
  }, [currentQuestionHash, error, isLoading, setShowLoading]);

  useEffect(() => {
    // If player has fetched the question, update status to fetched
    if (isLoading || !data || !player) return;
    if (player.fetchedStatus === FetchedStatus.fetched) return;

    updatePlayerStats({
      ...player,
      fetchedStatus: FetchedStatus.fetched,
    });
  }, [data, isLoading, player, updatePlayerStats]);

  if (error)
    return (
      <div className="border-error/20 bg-error/5 flex h-full flex-col items-center justify-center border p-6">
        <h1 className="text-error font-bold">Failed to load question.</h1>
      </div>
    );

  if (!data)
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <h1 className="font-bold">Loading...</h1>
      </div>
    );

  const hasText = !!data.challenge.text;
  const hasImage = !!data.challenge.image;
  const image = data.challenge.image;
  const isSvgImage = image?.type.includes("svg") ?? false;

  return (
    <div className="border-base-content/10 bg-base-100/40 flex h-full flex-col items-center justify-center gap-4 border p-6 backdrop-blur-xl">
      <h1 className="mb-2 text-2xl font-bold">{data.challenge.prompt}</h1>

      {hasText && (
        <section className="bg-gray-200 p-6">
          <q>{data.challenge.text}</q>
        </section>
      )}

      {hasImage && showPicture && (
        <figure className="max-w-full overflow-hidden">
          {isSvgImage ? (
            <SvgBase64Image base64={image!.base64} alt={data.details} />
          ) : (
            <Base64Image
              type={image!.type}
              base64={image!.base64}
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
