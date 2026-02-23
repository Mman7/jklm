import { useEffect, useState } from "react";
import useAuth from "../zustands/useAuthStore";
import useMounted from "./useMounted";

export default function useUserValid() {
  const { name, playerId } = useAuth();
  const [isUserHasName, setIsUserHasName] = useState(false);
  const [isUserHasId, setIsUserHasId] = useState(false);
  const mounted = useMounted();

  const checkUserHasName = () => name !== "";
  const checkUserHasId = () => playerId !== "";

  useEffect(() => {
    if (!mounted) return;
    setIsUserHasName(checkUserHasName());
    setIsUserHasId(checkUserHasId());
  }, [name, playerId, mounted]);

  return {
    isUserValid: isUserHasName && isUserHasId,
    isUserHasName,
    isUserHasId,
  };
}
