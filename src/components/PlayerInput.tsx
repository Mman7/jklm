import { useState } from "react";
import { sendMessage } from "../library/client/ably_client";
import ky from "ky";
import { useAuthStore } from "../zustands/useAuthStore";
import { useQuestionStore } from "../zustands/useQuestionStore";
import {
  AnswerValidationRequest,
  AnswerValidationResponse,
} from "../types/answer_validation";
import { useRoomStore } from "../zustands/useRoomStore";
import { Player } from "../types/player";
import { PlayerStatus } from "../types/enum/player_status";
import { playSound, SoundOptions } from "../utils/play_sounds";

/**
 * Helper function to validate the player's answer with the server.
 * Makes a POST request to the /api/answer-validation endpoint.
 */
async function validateAnswer(
  body: AnswerValidationRequest,
): Promise<AnswerValidationResponse> {
  const isLocalhost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  // Prefer the route that matches the current environment, but keep a fallback
  // so local dev and deployed edge/runtime setups both continue to work.
  const endpoints = isLocalhost
    ? ["/api/answer-validation", "/edge/answer-validation"]
    : ["/edge/answer-validation", "/api/answer-validation"];

  for (const endpoint of endpoints) {
    try {
      const response = await ky.post(endpoint, {
        json: body,
        throwHttpErrors: false,
      });

      if (response.ok) {
        return response.json();
      }
    } catch {
      // Try the next endpoint fallback.
    }
  }

  throw new Error("Failed to validate answer");
}

/**
 * Main player input component.
 * Handles local state for the input field and server communication for answer validation.
 */
export default function PlayerInput() {
  const playerId = useAuthStore((s) => s.playerId);
  const room = useRoomStore((s) => s.room);
  const player = useRoomStore((s) => s.player);
  const updatePlayerStats = useRoomStore((s) => s.updatePlayerStats);
  const currentQuestionHash = useQuestionStore((s) => s.currentQuestionHash);
  const [inputValue, setInputValue] = useState<string>("");
  const isAnswerLocked = player?.playerStatus === PlayerStatus.answer_correct;

  const submitAnswer = async () => {
    if (isAnswerLocked) return;

    const submittedAnswer = inputValue.trim();
    if (!submittedAnswer) return;

    const body: AnswerValidationRequest = {
      playerId: playerId,
      roomId: room?.id || "",
      questionHash: currentQuestionHash?.hash || "",
      answerSubmit: submittedAnswer,
    };

    // Clear the field immediately so the UI stays responsive while validation
    // happens in the background.
    setInputValue("");

    const response = await validateAnswer(body);

    if (!response.correct) {
      // Incorrect guesses are still published so the rest of the room can react
      // to them through the existing realtime flow.
      sendMessage(submittedAnswer, playerId);
    }

    if (response.correct && response.score !== undefined && player) {
      const updatedPlayer: Player = { ...player };
      updatedPlayer.score = response.score;
      updatedPlayer.playerStatus = PlayerStatus.answer_correct;
      playSound(SoundOptions.Correct);

      // Reflect the successful answer locally right away instead of waiting for
      // the next sync event from the room state.
      updatePlayerStats(updatedPlayer);
    }
  };

  /**
   * Event handler triggered when a key is pressed in the input field.
   * Validates the answer upon hitting "Enter" and updates local player stats if correct.
   */
  const handleKeyDown = async (event: any) => {
    if (isAnswerLocked) return;

    if (event.key === "Enter") {
      await submitAnswer();
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
    <footer className="bg-base-100 my-3 rounded-3xl border border-gray-200 px-4 pt-3 pb-2 shadow-sm">
      {!isAnswerLocked ? (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-2">
          <div className="bg-primary/10 flex h-12 w-full items-center gap-2 rounded-full px-4">
            <input
              value={inputValue}
              onChange={(e) => onChanged(e)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              className="placeholder:text-base-content/50 text-base-content h-full w-full bg-transparent text-center text-base font-medium outline-none"
            ></input>
            <button
              type="button"
              className="btn btn-primary btn-circle btn-sm"
              onClick={submitAnswer}
              disabled={!inputValue.trim()}
            >
              ➤
            </button>
          </div>
          <p className="text-base-content/50 text-xs font-medium">
            Press <span className="badge badge-xs bg-primary/5 p-2">ENTER</span>{" "}
            to submit
          </p>
        </div>
      ) : (
        <h1 className="text-success text-center font-semibold">
          You are correct!
        </h1>
      )}
    </footer>
  );
}
