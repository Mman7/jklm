import { useEffect } from "react";
import { getRoom } from "../library/client/client";
import useLoadingDialog from "../zustands/useLoadingStore";
import { useParams, useRouter } from "next/navigation";
import useRoom from "../zustands/useRoomStore";
import useQuestion from "../zustands/useQuestionStore";

/**
 * Custom hook to handle the initialization logic for a room.
 *
 * This hook loads the room data when the component mounts,
 * sets the global state for the room and questions, and manages the loading UI.
 */
export default function useRoomInitializer() {
  // Access the function to toggle the loading dialog state from the global store
  const { setShowLoading } = useLoadingDialog();

  // Router instance for navigation
  const router = useRouter();

  // Hook to access current route parameters
  const params = useParams();

  // Extract the roomId from route params (handling cases where it might be undefined)
  // If params.id is not a string, default to an empty string
  const roomId = typeof params.id === "string" ? params.id : "";

  // Destructure the 'setRoom' action from the global room store
  const { setRoom } = useRoom();

  // Destructure the 'setQuestionList' action from the global question store
  const { setQuestionList } = useQuestion();

  useEffect(() => {
    /**
     * Async function to fetch and set room data.
     * Handles loading states, errors, and finalization.
     */
    const loadRoom = async () => {
      // Show the loading dialog while fetching data
      setShowLoading(true);

      try {
        // Fetch room data using the client utility
        await getRoom(roomId).then((res) => {
          // Update the global room state with the fetched data
          setRoom(res);
          // Update the global question list state, or an empty array if res is null/undefined
          setQuestionList(res?.questionList || []);
        });
      } catch {
        // Handle errors (e.g., room not found or API failure)
        // Redirect to the home page
        router.push("/");
      } finally {
        // Ensure the loading dialog is hidden regardless of success or failure
        setShowLoading(false);
      }
    };

    // Execute the initialization logic
    loadRoom();
  }, []); // Empty dependency array means this effect runs once on mount

  return {};
}
