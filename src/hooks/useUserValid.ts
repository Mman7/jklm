import { useEffect, useState } from "react";
import useAuth from "../zustands/useAuthStore";

export default function useUserValid() {
  const { name, playerId } = useAuth();
  const [isUserHasName, setIsUserHasName] = useState(false);
  const [isUserHasId, setIsUserHasId] = useState(false);

  const checkUserHasName = () => name !== "" && name !== null;
  const checkUserHasId = () => playerId !== "" && playerId !== null;

  useEffect(() => {
    setIsUserHasName(checkUserHasName());
    setIsUserHasId(checkUserHasId());
  }, [name, playerId]);

  return {
    isUserValid: isUserHasName && isUserHasId,
    isUserHasName,
    isUserHasId,
  };
}
