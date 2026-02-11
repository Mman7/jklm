import { TokenRequest } from "ably";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  token: TokenRequest | null;
  setToken: (token: TokenRequest | null) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token: TokenRequest | null) => set({ token }),
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default function useAuth() {
  const { token, setToken } = useAuthStore();
  return { token, setToken };
}
