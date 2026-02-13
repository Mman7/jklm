import { InputEvent, useState } from "react";
import { sendMessage } from "../library/client/ably_client";
import useGame from "../zustands/useGameStore";

export default function PlayerInput() {
  const { playerId } = useGame();
  const [inputValue, setInputValue] = useState<string>("");

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      sendMessage(inputValue, playerId);
      setInputValue(" ");
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
