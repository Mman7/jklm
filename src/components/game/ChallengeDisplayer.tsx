import useSWR from "swr";
import { FetchedStatus, PlayerStatus } from "@/src/types/enum/player_status";
import useGame from "@/src/zustands/useGameStore";
import useLoadingDialog from "@/src/zustands/useLoadingStore";
import useQuestion from "@/src/zustands/useQuestionStore";
import useRoom from "@/src/zustands/useRoomStore";
import { useEffect, useMemo } from "react";
import { getQuestions } from "@/src/library/client/client";
import { Question } from "@/src/types/question";
import SvgBase64Image from "./SvgBase64Image";
import Base64Image from "./Base64Image";
import { ArrowRight } from "lucide-react";

const DEFAULT_QUESTION_DURATION_SECONDS = 20;

export default function ChallengeDisplayer() {
  const { showPicture } = useGame();
  const {
    currentQuestionHash,
    currentQuestion,
    questionList,
    setCurrentQuestion,
  } = useQuestion();
  const { setShowLoading } = useLoadingDialog();
  const { updatePlayerStats, player, room } = useRoom();

  const roundHashes = useMemo(
    () => questionList.map((question) => question.hash),
    [questionList],
  );
  const questionDurationSeconds =
    room?.questionDurationSeconds ?? DEFAULT_QUESTION_DURATION_SECONDS;

  const { data, isLoading, error } = useSWR<Question[]>(
    roundHashes.length > 0
      ? {
          type: "round-questions",
          hashes: roundHashes,
          questionDurationSeconds,
        }
      : null,
    async ({ hashes, questionDurationSeconds }) => {
      const questions = await getQuestions(
        hashes.map((hash: string) => ({ hash })),
        questionDurationSeconds,
      );
      console.log(questions);
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
        end_time: Date.now() + questionDurationSeconds * 1000,
      },
    });
  }, [
    currentQuestionHash?.hash,
    room?.questionDurationSeconds,
    selectedQuestion,
    setCurrentQuestion,
  ]);

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
      playerStatus: PlayerStatus.waiting,
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
    <div className="bg-base-100/70 border-base-300 flex h-full flex-col overflow-hidden rounded-3xl border shadow-sm">
      <div className="from-primary/20 via-primary to-primary/20 h-1 w-full bg-linear-to-r" />

      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-5 px-5 py-6 text-center sm:px-8">
        {hasImage && showPicture && (
          <figure className="flex w-full justify-center overflow-hidden rounded-2xl">
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
          <div className="bg-base-200 text-base-content/60 w-full rounded-2xl px-4 py-6 text-sm">
            Image will appear when all players are ready.
          </div>
        )}

        <h1 className="max-w-xl text-2xl leading-tight font-bold sm:text-3xl">
          {activeQuestion.challenge.prompt}
        </h1>

        {hasText && (
          <section className="bg-base-200 text-base-content/80 w-full rounded-2xl px-5 py-4 text-base">
            <q>{activeQuestion.challenge.text}</q>
          </section>
        )}
      </div>
    </div>
  );
}
