import { useEffect, useState } from "react";
import useAuth from "../zustands/useAuthStore";
import useMounted from "./useMounted";

/**
 * Custom hook to validate user identity based on state.
 *
 * This hook checks if the user has a name and a player ID by reading values
 * from the global auth store. It returns booleans indicating whether these
 * required fields are populated.
 *
 * @returns An object containing:
 *   - `isUserValid`: true if both name and playerId are non-empty strings.
 *   - `isUserHasName`: true if the user's name is set.
 *   - `isUserHasId`: true if the user's playerId is set.
 */
export default function useUserValid() {
  const { name, playerId } = useAuth();
  const [isUserHasName, setIsUserHasName] = useState(false);
  const [isUserHasId, setIsUserHasId] = useState(false);
  const mounted = useMounted();

  // Function to check if the name state is not an empty string.
  const checkUserHasName = () => name !== "";

  // Function to check if the playerId state is not an empty string.
  const checkUserHasId = () => playerId !== "";

  useEffect(() => {
    // Prevent state updates if the component is not yet mounted on the client.
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
