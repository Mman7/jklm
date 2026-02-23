import { create } from "zustand";
import { QuestionHashOnly } from "../types/question";

interface GameStore {
  questionList: QuestionHashOnly[];
  setQuestionList: (questions: QuestionHashOnly[]) => void;
  currentQuestion: QuestionHashOnly | null;
  setCurrentQuestion: (question: QuestionHashOnly | null) => void;
}

const useGameStore = create<GameStore>((set) => ({
  questionList: [],
  setQuestionList: (questions: QuestionHashOnly[]) =>
    set({ questionList: questions }),
  currentQuestion: null,
  setCurrentQuestion: (question: QuestionHashOnly | null) =>
    set({ currentQuestion: question }),
}));

export default function useGame() {
  const { questionList, setQuestionList, currentQuestion, setCurrentQuestion } =
    useGameStore();
  return { questionList, setQuestionList, currentQuestion, setCurrentQuestion };
}
