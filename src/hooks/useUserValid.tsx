import React, { useEffect, useState } from "react";
import useGame from "../zustands/useGameStore";
import useAuth from "../zustands/useAuthStore";

export default function useUserValid() {
  const { name } = useGame();
  const { token } = useAuth();
  const [isUserHasName, setIsUserHasName] = useState(false);
  const [isUserHasToken, setIsUserHasToken] = useState(false);

  const checkUserHasName = () => {
    return name !== "" && name !== null;
  };

  const checkUserHasToken = () => {
    return token !== null;
  };

  useEffect(() => {
    setIsUserHasName(checkUserHasName());
    setIsUserHasToken(checkUserHasToken());
  }, [name, token]);

  return {
    isUserValid: isUserHasName && isUserHasToken,
    isUserHasName,
    isUserHasToken,
  };
}
