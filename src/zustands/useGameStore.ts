import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameStore {
  name: string;
  setName: (name: string) => void;
  uuid: string;
  setUUID: (uuid: string) => void;
}

const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      name: "",
      uuid: "",
      setName: (name: string) => set({ name }),
      setUUID: (uuid: string) => set({ uuid }),
    }),
    {
      name: "game-storage",
    },
  ),
);

export default function useGame() {
  const { name, setName, uuid, setUUID } = useGameStore();
  return { name, setName, uuid, setUUID };
}
