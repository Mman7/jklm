"use client";

import { updateRoomSettings } from "@/src/library/client/client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useGame from "../zustands/useGameStore";
import useAuth from "../zustands/useAuthStore";
import useRoom from "../zustands/useRoomStore";

const DEFAULT_TARGET_SCORE = 100;
const DEFAULT_QUESTION_DURATION_SECONDS = 20;

export default function Sidebar() {
  const path = usePathname();
  const { gameReady } = useGame();
  const { playerId } = useAuth();
  const { room, setRoom } = useRoom();
  const [targetScore, setTargetScore] = useState(DEFAULT_TARGET_SCORE);
  const [questionDurationSeconds, setQuestionDurationSeconds] = useState(
    DEFAULT_QUESTION_DURATION_SECONDS,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const shouldHideSidebar = path === "/" || gameReady;
  const isHost = !!room && room.hostId === playerId;

  useEffect(() => {
    if (!room) return;
    setTargetScore(room.targetScore ?? DEFAULT_TARGET_SCORE);
    setQuestionDurationSeconds(
      room.questionDurationSeconds ?? DEFAULT_QUESTION_DURATION_SECONDS,
    );
  }, [room]);

  const handleSave = async () => {
    if (!room || !playerId || !isHost) return;

    const normalizedTargetScore = Math.min(1000, Math.max(1, targetScore));
    const normalizedQuestionDuration = Math.min(
      180,
      Math.max(5, questionDurationSeconds),
    );

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const updatedRoom = await updateRoomSettings(room.id, {
        playerId,
        targetScore: normalizedTargetScore,
        questionDurationSeconds: normalizedQuestionDuration,
      });

      setRoom(updatedRoom);
      setTargetScore(updatedRoom.targetScore ?? normalizedTargetScore);
      setQuestionDurationSeconds(
        updatedRoom.questionDurationSeconds ?? normalizedQuestionDuration,
      );
      setSaveMessage("Settings saved");
    } catch {
      setSaveMessage("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`drawer-side lg:h-[calc(100vh-4rem)] ${shouldHideSidebar ? "hidden" : ""}`}
    >
      <label
        htmlFor="my-drawer-3"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <ul className="menu border-base-content/10 bg-base-100/90 min-h-full w-80 border-r p-4 backdrop-blur-xl">
        <li className="menu-title pointer-events-none">
          <span>Game Settings</span>
        </li>
        <li className="rounded-lg p-2">
          <label className="label pointer-events-none p-0 pb-1">
            <span className="label-text">Target score to win</span>
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={targetScore}
            onChange={(event) => setTargetScore(Number(event.target.value))}
            disabled={!isHost || isSaving}
            className="input input-bordered input-sm w-full"
          />
        </li>
        <li className="rounded-lg p-2">
          <label className="label pointer-events-none p-0 pb-1">
            <span className="label-text">Question duration (seconds)</span>
          </label>
          <input
            type="number"
            min={5}
            max={180}
            value={questionDurationSeconds}
            onChange={(event) =>
              setQuestionDurationSeconds(Number(event.target.value))
            }
            disabled={!isHost || isSaving}
            className="input input-bordered input-sm w-full"
          />
        </li>
        <li className="mt-2 p-2">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={!isHost || isSaving}
          >
            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </li>
        {!isHost && (
          <li className="px-2 pt-1 text-xs opacity-70">
            Only room host can change settings.
          </li>
        )}
        {saveMessage && <li className="px-2 pt-1 text-xs">{saveMessage}</li>}
      </ul>
    </div>
  );
}
