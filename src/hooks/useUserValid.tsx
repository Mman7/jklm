import { useEffect, useState } from "react";
import useGame from "../zustands/useGameStore";

export default function useUserValid() {
  const { name, playerId } = useGame();
  const [isUserHasName, setIsUserHasName] = useState(false);
  const [isUserHasId, setIsUserHasId] = useState(false);

  const checkUserHasName = () => name !== "" && name !== null;
  const checkUserHasId = () => playerId !== "" && playerId !== null;

  useEffect(() => {
    setIsUserHasName(checkUserHasName());
    setIsUserHasId(checkUserHasId());
  }, [name]);

  return {
    isUserValid: isUserHasName && playerId,
    isUserHasName,
    isUserHasId,
  };
}
