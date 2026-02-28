import useSWR from "swr";
import { FetchedStatus } from "@/src/types/enum/player_status";
import useGame from "@/src/zustands/useGameStore";
import useLoadingDialog from "@/src/zustands/useLoadingStore";
import useQuestion from "@/src/zustands/useQuestionStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useEffect, useMemo } from "react";
import { getQuestions } from "@/src/library/client/client";
import { Question } from "@/src/types/question";
import SvgBase64Image from "./SvgBase64Image";
import Base64Image from "./Base64Image";

export default function ChallengeDisplayer() {
  const { showPicture } = useGame();
  const {
    currentQuestionHash,
    currentQuestion,
    questionList,
    setCurrentQuestion,
  } = useQuestion();
  const { setShowLoading } = useLoadingDialog();
  const { updatePlayerStats, player } = useRoom();

  const roundHashes = useMemo(
    () => questionList.map((question) => question.hash),
    [questionList],
  );

  const { data, isLoading, error } = useSWR<Question[]>(
    roundHashes.length > 0
      ? { type: "round-questions", hashes: roundHashes }
      : null,
    async ({ hashes }) => {
      const questions = await getQuestions(
        hashes.map((hash: string) => ({ hash })),
      );
      console.log("Fetched questions:", questions);
      if (!questions || questions.length === 0) {
        throw new Error("Questions not found");
      }
      return questions;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const selectedQuestion = useMemo(() => {
    if (!data || !currentQuestionHash?.hash) return null;
    return (
      data.find(
        (question) => question.challenge.hash === currentQuestionHash.hash,
      ) || null
    );
  }, [currentQuestionHash?.hash, data]);

  const activeQuestion = useMemo(() => {
    if (
      currentQuestion &&
      currentQuestionHash?.hash &&
      currentQuestion.challenge.hash === currentQuestionHash.hash
    ) {
      return currentQuestion;
    }

    return selectedQuestion;
  }, [currentQuestion, currentQuestionHash?.hash, selectedQuestion]);

  useEffect(() => {
    if (!selectedQuestion || !currentQuestionHash?.hash) return;

    setCurrentQuestion({
      ...selectedQuestion,
      challenge: {
        ...selectedQuestion.challenge,
        end_time: Date.now() + 20_000,
      },
    });
  }, [currentQuestionHash?.hash, selectedQuestion, setCurrentQuestion]);

  useEffect(() => {
    setShowLoading(
      !!currentQuestionHash && !error && (isLoading || !selectedQuestion),
    );
  }, [currentQuestionHash, error, isLoading, selectedQuestion, setShowLoading]);

  useEffect(() => {
    // If player has fetched the question, update status to fetched
    if (isLoading || !selectedQuestion || !player) return;
    if (player.fetchedStatus === FetchedStatus.fetched) return;

    updatePlayerStats({
      ...player,
      fetchedStatus: FetchedStatus.fetched,
    });
  }, [isLoading, player, selectedQuestion, updatePlayerStats]);

  if (error)
    return (
      <div className="border-error/20 bg-error/5 flex h-full flex-col items-center justify-center border p-6">
        <h1 className="text-error font-bold">Failed to load question.</h1>
      </div>
    );

  if (!activeQuestion)
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <h1 className="font-bold">Loading...</h1>
      </div>
    );

  const hasText = !!activeQuestion.challenge.text;
  const hasImage = !!activeQuestion.challenge.image;
  const image = activeQuestion.challenge.image;
  const isSvgImage = image?.type.includes("svg") ?? false;

  return (
    <div className="border-base-content/10 bg-base-100/40 flex h-full flex-col items-center justify-center gap-4 border p-6 backdrop-blur-xl">
      <h1 className="mb-2 text-2xl font-bold">
        {activeQuestion.challenge.prompt}
      </h1>

      {hasText && (
        <section className="bg-gray-200 p-6">
          <q>{activeQuestion.challenge.text}</q>
        </section>
      )}

      {hasImage && showPicture && (
        <figure className="max-w-full overflow-hidden">
          {isSvgImage ? (
            <SvgBase64Image
              base64={image!.base64}
              alt={activeQuestion.details}
            />
          ) : (
            <Base64Image
              type={image!.type}
              base64={image!.base64}
              alt={activeQuestion.details}
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
