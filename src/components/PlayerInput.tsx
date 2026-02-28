import { useState } from "react";
import { sendMessage } from "../library/client/ably_client";
import useAuth from "../zustands/useAuthStore";
import useQuestion from "../zustands/useQuestionStore";
import {
  AnswerValidationRequest,
  AnswerValidationResponse,
} from "../app/api/answer-validation/route";
import useRoom from "../zustands/useRoomStore";
import { Player } from "../types/player";
import { PlayerStatus } from "../types/enum/player_status";

/**
 * Helper function to validate the player's answer with the server.
 * Makes a POST request to the /api/answer-validation endpoint.
 */
async function validateAnswer(
  body: AnswerValidationRequest,
): Promise<AnswerValidationResponse> {
  const res = await fetch("/api/answer-validation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data;
}

/**
 * Main player input component.
 * Handles local state for the input field and server communication for answer validation.
 */
export default function PlayerInput() {
  const { playerId } = useAuth();
  const { room, player, updatePlayerStats } = useRoom();
  const { currentQuestionHash } = useQuestion();
  const [inputValue, setInputValue] = useState<string>("");

  /**
   * Event handler triggered when a key is pressed in the input field.
   * Validates the answer upon hitting "Enter" and updates local player stats if correct.
   */
  const handleKeyDown = async (event: any) => {
    if (event.key === "Enter") {
      // Send the answer to the real-time messaging service (Ably)
      sendMessage(inputValue, playerId);

      // Construct the request body for the API validation endpoint
      const body: AnswerValidationRequest = {
        playerId: playerId,
        roomId: room?.id || "", // You need to provide the roomId here
        questionHash: currentQuestionHash?.hash || "",
        answerSubmit: inputValue,
      };

      const response = await validateAnswer(body);

      // If the server confirms the answer is correct and returns a score,
      // update the local player object with the new score.
      if (response.correct && response.score !== undefined && player) {
        const updatedPlayer: Player = { ...player };
        updatedPlayer.score = response.score;
        updatedPlayer.playerStatus = PlayerStatus.answer_correct;
        updatePlayerStats(updatedPlayer);
      }

      // Clear the input field after submission
      setInputValue("");
    }
  };

  /**
   * Event handler triggered when the input field's value changes.
   * Updates the local state with the new input value.
   */
  const onChanged = (e: any) => {
    setInputValue(e.target.value);
  };

  return (
    // Footer container with a negative margin-top to overlap content, flex layout for centering,
    // fixed height, and a glass-styled background.
    <footer className="border-base-content/10 bg-base-100/80 -mt-6 flex h-14 w-full items-center border-t p-4 shadow-lg backdrop-blur-xl">
      <input
        value={inputValue}
        // Binds the onChange event to the onChanged function
        onChange={(e) => onChanged(e)}
        // Binds the onKeyDown event to the handleKeyDown function
        onKeyDown={handleKeyDown}
        placeholder="Type your answer and press Enter..."
        className="border-base-content/20 bg-base-100/60 focus:border-primary focus:ring-primary/20 h-full w-full rounded-2xl border p-6 px-4 backdrop-blur-xl transition-all focus:ring-2 focus:outline-none"
      ></input>
    </footer>
  );
}
