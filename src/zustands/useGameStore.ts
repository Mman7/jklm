import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameStore {
  name: string;
  setName: (name: string) => void;
  playerId: string;
  setPlayerId: (uuid: string) => void;
}

const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      name: "",
      playerId: "",
      setName: (name: string) => set({ name }),
      setPlayerId: (uuid: string) => set({ playerId: uuid }),
    }),
    {
      name: "game-storage",
    },
  ),
);

export default function useGame() {
  const { name, setName, playerId, setPlayerId } = useGameStore();
  return { name, setName, playerId, setPlayerId };
}
