import { useEffect, useRef } from "react";
import Ably from "ably";
import { initAbly, leaveRoom } from "../library/client/ably_client";
import { FetchedStatus, PlayerStatus } from "../types/enum/player_status";
import { Player } from "../types/player";
import { QuestionHashOnly } from "../types/question";
import { Room } from "../types/room";

type UseGamePageBootstrapParams = {
  mounted: boolean;
  isUserValid: boolean;
  setShowNameDialog: (showDialog: boolean) => void;
  roomId: string;
  playerId: string;
  setChannel: (channel: Ably.RealtimeChannel | null) => void;
  room: Room | null;
  name: string;
  updatePlayerStats: (player: Player) => void;
  questionList: QuestionHashOnly[];
  currentQuestionHash: QuestionHashOnly | null;
  setCurrentQuestionHash: (question: QuestionHashOnly | null) => void;
};

export default function useGamePageBootstrap({
  mounted,
  isUserValid,
  setShowNameDialog,
  roomId,
  playerId,
  setChannel,
  room,
  name,
  updatePlayerStats,
  questionList,
  currentQuestionHash,
  setCurrentQuestionHash,
}: UseGamePageBootstrapParams) {
  // Avoid re-initializing player stats more than once per room+player pair.
  const initializedPlayerKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // Prompt for name setup when user identity is not valid.
    if (!isUserValid) {
      setShowNameDialog(true);
    } else {
      setShowNameDialog(false);
    }
  }, [mounted, isUserValid, setShowNameDialog]);

  useEffect(() => {
    if (!mounted) return;
    // Initialize Ably channel for the room and expose it to store/state.
    const ch = initAbly({ roomId, playerId });
    setChannel(ch);
    return () => {
      // Cleanup realtime presence/channel on page unmount or room switch.
      leaveRoom();
    };
  }, [mounted, roomId, playerId, setChannel]);

  useEffect(() => {
    if (!room) return;

    const initKey = `${room.id}:${playerId}`;
    if (initializedPlayerKeyRef.current === initKey) return;
    initializedPlayerKeyRef.current = initKey;

    // Seed local player stats from persisted room score when available.
    const scores = room?.scores?.[playerId];
    updatePlayerStats({
      name: name,
      playerId: playerId,
      score: scores || 0,
      lastChat: "",
      playerStatus: PlayerStatus.waiting,
      fetchedStatus: FetchedStatus.fetching,
    });
  }, [name, playerId, room, updatePlayerStats]);

  useEffect(() => {
    if (!room) return;

    // Prefer current store question list; otherwise fall back to room snapshot.
    const sourceQuestionList =
      questionList.length > 0 ? questionList : (room.questionList ?? []);
    if (sourceQuestionList.length === 0) return;

    // Keep current question aligned with the active question list.
    const hasValidCurrentQuestion =
      !!currentQuestionHash &&
      sourceQuestionList.some((q) => q.hash === currentQuestionHash.hash);

    if (!hasValidCurrentQuestion) {
      setCurrentQuestionHash(sourceQuestionList[0] || null);
    }
  }, [room, questionList, currentQuestionHash, setCurrentQuestionHash]);
}
