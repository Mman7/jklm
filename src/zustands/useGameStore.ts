import { create } from "zustand";

interface GameStore {
  questionList: string[];
  setQuestionList: (questions: string[]) => void;
}

const useGameStore = create<GameStore>((set) => ({
  questionList: [],
  setQuestionList: (questions: string[]) => set({ questionList: questions }),
}));

export default function useGame() {
  const { questionList, setQuestionList } = useGameStore();
  return { questionList, setQuestionList };
}
