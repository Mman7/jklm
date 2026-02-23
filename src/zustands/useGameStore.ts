import { create } from "zustand";
import { Question, QuestionHashOnly } from "../types/question";

interface GameStore {
  questionList: QuestionHashOnly[];
  setQuestionList: (questions: QuestionHashOnly[]) => void;
  currentQuestion: Question | null;
  setCurrentQuestion: (question: Question | null) => void;
  currentQuestionHash: QuestionHashOnly | null;
  setCurrentQuestionHash: (question: QuestionHashOnly | null) => void;
  goToNextQuestion: () => void;
}

const useGameStore = create<GameStore>((set) => ({
  questionList: [],
  setQuestionList: (questions: QuestionHashOnly[]) =>
    set({ questionList: questions }),
  currentQuestion: null,
  setCurrentQuestion: (question: Question | null) =>
    set({ currentQuestion: question }),
  currentQuestionHash: null,
  setCurrentQuestionHash: (question: QuestionHashOnly | null) =>
    set({ currentQuestionHash: question }),

  goToNextQuestion: () =>
    set((state) => {
      const currentIndex = findCurrentIndex(
        state.questionList,
        state.currentQuestionHash,
      );

      const nextIndex = currentIndex + 1;

      if (nextIndex < state.questionList.length) {
        return { currentQuestionHash: state.questionList[nextIndex] };
      }

      return {
        currentQuestionHash: null,
      };
    }),
}));

const findCurrentIndex = (
  questionList: QuestionHashOnly[],
  currentQuestionHash: QuestionHashOnly | null,
) => {
  return questionList.findIndex((q) => q.hash === currentQuestionHash?.hash);
};

export default function useGame() {
  const {
    questionList,
    setQuestionList,
    currentQuestion,
    setCurrentQuestion,
    currentQuestionHash,
    setCurrentQuestionHash,
    goToNextQuestion,
  } = useGameStore();
  return {
    questionList,
    setQuestionList,
    currentQuestionHash,
    setCurrentQuestionHash,
    currentQuestion,
    setCurrentQuestion,
    goToNextQuestion,
  };
}
