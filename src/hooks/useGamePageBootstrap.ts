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
  const initializedPlayerKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isUserValid) {
      setShowNameDialog(true);
    } else {
      setShowNameDialog(false);
    }
  }, [mounted, isUserValid, setShowNameDialog]);

  useEffect(() => {
    if (!mounted) return;
    const ch = initAbly({ roomId, playerId });
    setChannel(ch);
    return () => {
      leaveRoom();
    };
  }, [mounted, roomId, playerId, setChannel]);

  useEffect(() => {
    if (!room) return;

    const initKey = `${room.id}:${playerId}`;
    if (initializedPlayerKeyRef.current === initKey) return;
    initializedPlayerKeyRef.current = initKey;

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

    const sourceQuestionList =
      questionList.length > 0 ? questionList : (room.questionList ?? []);
    if (sourceQuestionList.length === 0) return;

    const hasValidCurrentQuestion =
      !!currentQuestionHash &&
      sourceQuestionList.some((q) => q.hash === currentQuestionHash.hash);

    if (!hasValidCurrentQuestion) {
      setCurrentQuestionHash(sourceQuestionList[0] || null);
    }
  }, [room, questionList, currentQuestionHash, setCurrentQuestionHash]);
}
