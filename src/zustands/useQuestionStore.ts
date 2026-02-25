import { create } from "zustand";
import { Question, QuestionHashOnly } from "../types/question";

interface QuestionStore {
  questionList: QuestionHashOnly[];
  setQuestionList: (questions: QuestionHashOnly[]) => void;
  currentQuestion: Question | null;
  setCurrentQuestion: (question: Question | null) => void;
  currentQuestionHash: QuestionHashOnly | null;
  setCurrentQuestionHash: (question: QuestionHashOnly | null) => void;
  goToNextQuestion: () => void;
  currentIndexInList: number;
}

const useQuestionStore = create<QuestionStore>((set) => ({
  currentIndexInList: 0,
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
        return {
          currentQuestionHash: state.questionList[nextIndex],
          currentIndexInList: nextIndex,
        };
      }

      return {
        currentQuestionHash: null,
        currentIndexInList: 0,
      };
    }),
}));

const findCurrentIndex = (
  questionList: QuestionHashOnly[],
  currentQuestionHash: QuestionHashOnly | null,
) => {
  return questionList.findIndex((q) => q.hash === currentQuestionHash?.hash);
};

export default function useQuestion() {
  const {
    questionList,
    setQuestionList,
    currentQuestion,
    setCurrentQuestion,
    currentQuestionHash,
    setCurrentQuestionHash,
    goToNextQuestion,
    currentIndexInList,
  } = useQuestionStore();

  return {
    questionList,
    setQuestionList,
    currentQuestion,
    setCurrentQuestion,
    currentQuestionHash,
    setCurrentQuestionHash,
    goToNextQuestion,
    currentIndexInList,
  };
}
