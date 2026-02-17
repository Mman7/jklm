import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  name: string;
  setName: (name: string) => void;
  playerId: string;
  setPlayerId: (uuid: string) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      name: "",
      playerId: "",
      setName: (name: string) => set({ name }),
      setPlayerId: (uuid: string) => set({ playerId: uuid }),
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default function useAuth() {
  const { name, setName, playerId, setPlayerId } = useAuthStore();
  return { name, setName, playerId, setPlayerId };
}
