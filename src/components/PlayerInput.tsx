import { useState } from "react";
import { sendMessage } from "../library/client/ably_client";
import useAuth from "../zustands/useAuthStore";
import useGame from "../zustands/useGameStore";
import {
  AnswerValidationRequest,
  AnswerValidationResponse,
} from "../app/api/answer-validation/route";
import useRoom from "../zustands/useRoomStore";

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

export default function PlayerInput() {
  const { playerId } = useAuth();
  const { room } = useRoom();
  const { currentQuestionHash } = useGame();
  const [inputValue, setInputValue] = useState<string>("");

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      sendMessage(inputValue, playerId);
      const body: AnswerValidationRequest = {
        playerId: playerId,
        roomId: room?.id || "", // You need to provide the roomId here
        questionHash: currentQuestionHash?.hash || "",
        answerSubmit: inputValue,
      };

      validateAnswer(body);
      setInputValue("");
    }
  };

  const onChanged = (e: any) => {
    setInputValue(e.target.value);
  };

  return (
    //TODO implement user input
    <footer className="-mt-6 flex h-12 w-full items-center bg-gray-300 p-4">
      <input
        value={inputValue}
        onChange={(e) => onChanged(e)}
        onKeyDown={handleKeyDown}
        className="h-full w-full bg-red-500 p-4"
      ></input>
    </footer>
  );
}
