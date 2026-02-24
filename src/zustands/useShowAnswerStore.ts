import { create } from "zustand";

interface ShowAnswerStore {
  showAnswer: boolean;
  setShowAnswer: (val: boolean) => void;
}
export const useShowAnswerStore = create<ShowAnswerStore>((set) => ({
  showAnswer: false,
  setShowAnswer: (val) => set((state) => ({ showAnswer: val })),
}));

export default function useShowAnswer() {
  const { showAnswer, setShowAnswer } = useShowAnswerStore();
  return {
    showAnswer,
    setShowAnswer,
  };
}
