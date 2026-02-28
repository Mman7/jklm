import { useEffect, useRef, useState } from "react";
import useShowAnswer from "../zustands/useShowAnswerStore";
import useGameController from "../hooks/useGameController";
import useQuestion from "../zustands/useQuestionStore";
import { getAnswer } from "../library/client/client";

export default function ShowAnswer() {
  const { setShowAnswer, showAnswer } = useShowAnswer();
  const { currentQuestionHash } = useQuestion();
  const { handleGoToNextQuestion } = useGameController();

  // Using refs to maintain stable references for function calls across re-renders
  const goNextRef = useRef(handleGoToNextQuestion);
  const setShowAnswerRef = useRef(setShowAnswer);
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Update refs whenever the function handles change to avoid stale closures
  useEffect(() => {
    goNextRef.current = handleGoToNextQuestion;
  }, [handleGoToNextQuestion]);

  useEffect(() => {
    setShowAnswerRef.current = setShowAnswer;
  }, [setShowAnswer]);

  // Fetch answer when the user switches to the 'show answer' state
  useEffect(() => {
    // Guard clause: Only proceed if showing answer AND a question hash is available
    if (!showAnswer || !currentQuestionHash?.hash) return;

    let isCancelled = false;

    const loadAnswer = async () => {
      setIsLoading(true);
      try {
        const result = await getAnswer(currentQuestionHash.hash);
        if (isCancelled) return; // Prevent state update if component unmounted
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
      isCancelled = true; // Cleanup flag on unmount
    };
  }, [currentQuestionHash?.hash, showAnswer]);

  // Auto-hide answer after 5 seconds and trigger next question
  useEffect(() => {
    if (!showAnswer) return;

    const timer = setTimeout(() => {
      setShowAnswerRef.current(false); // Set show answer to false via stable ref
      goNextRef.current(); // Call next function from stable ref
    }, 5000); // Hide answer after 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [showAnswer]);

  return (
    // Conditionally apply classes based on state; flex-3 seems to be a utility class not shown here
    <div className={`${showAnswer ? "block flex-3" : "hidden"}`}>
      <section className="border-base-content/20 from-success/20 to-success/5 flex size-full flex-col items-center justify-center gap-4 border bg-linear-to-br p-6 shadow-xl backdrop-blur-xl">
        <div className="bg-success/20 rounded-full p-4">
          <svg
            className="text-success h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Answer</h1>
        <p className="text-success text-center text-lg font-semibold">
          {/* Display loading state or answer text */}
          {isLoading ? "Loading answer..." : answer || "No answer available"}
        </p>
      </section>
    </div>
  );
}
