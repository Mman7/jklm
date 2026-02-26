import { useEffect, useRef, useState } from "react";
import useShowAnswer from "../zustands/useShowAnswerStore";
import useGameController from "../hooks/useGameController";
import useQuestion from "../zustands/useQuestionStore";
import { getAnswer } from "../library/client/client";

export default function ShowAnswer() {
  const { setShowAnswer, showAnswer } = useShowAnswer();
  const { currentQuestionHash } = useQuestion();
  const { handleGoToNextQuestion } = useGameController();
  const goNextRef = useRef(handleGoToNextQuestion);
  const setShowAnswerRef = useRef(setShowAnswer);
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    goNextRef.current = handleGoToNextQuestion;
  }, [handleGoToNextQuestion]);

  useEffect(() => {
    setShowAnswerRef.current = setShowAnswer;
  }, [setShowAnswer]);

  useEffect(() => {
    if (!showAnswer || !currentQuestionHash?.hash) return;

    let isCancelled = false;

    const loadAnswer = async () => {
      setIsLoading(true);
      try {
        const result = await getAnswer(currentQuestionHash.hash);
        if (isCancelled) return;
        setAnswer(result);
      } catch {
        if (isCancelled) return;
        setAnswer("Failed to load answer");
      } finally {
        if (isCancelled) return;
        setIsLoading(false);
      }
    };

    loadAnswer();

    return () => {
      isCancelled = true;
    };
  }, [currentQuestionHash?.hash, showAnswer]);

  useEffect(() => {
    if (!showAnswer) return;

    const timer = setTimeout(() => {
      goNextRef.current();
      setShowAnswerRef.current(false);
    }, 5000); // Hide answer after 5 seconds

    return () => clearTimeout(timer);
  }, [showAnswer]);

  return (
    <div className={`${showAnswer ? "block flex-3" : "hidden"}`}>
      <section className="flex size-full flex-col items-center justify-center gap-2 p-6">
        <h1 className="text-xl font-bold">Answer</h1>
        <p className="text-center">
          {isLoading ? "Loading answer..." : answer || "No answer available"}
        </p>
      </section>
    </div>
  );
}
