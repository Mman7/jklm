import { create } from "zustand";
import { Question, QuestionHashOnly } from "../types/question";

interface QuestionActions {
  setQuestionList: (questions: QuestionHashOnly[]) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setCurrentQuestionHash: (question: QuestionHashOnly | null) => void;
  goToNextQuestion: () => void;
}

interface QuestionStore {
  questionList: QuestionHashOnly[];
  currentQuestion: Question | null;
  currentQuestionHash: QuestionHashOnly | null;
  currentIndexInList: number;
  actions: QuestionActions;
}

export const useQuestionStore = create<QuestionStore>((set) => ({
  currentIndexInList: 0,
  questionList: [],
  currentQuestion: null,
  currentQuestionHash: null,
  actions: {
    setQuestionList: (questions: QuestionHashOnly[]) =>
      set({ questionList: questions }),
    setCurrentQuestion: (question: Question | null) =>
      set({ currentQuestion: question }),
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
  },
}));

function findCurrentIndex(
  questionList: QuestionHashOnly[],
  currentQuestionHash: QuestionHashOnly | null,
) {
  return questionList.findIndex((q) => q.hash === currentQuestionHash?.hash);
}

// custom hook that export only the actions
export function useQuestionActions() {
  return useQuestionStore((state) => state.actions);
}

export default useQuestionStore;
