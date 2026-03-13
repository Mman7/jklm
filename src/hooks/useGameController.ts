import { useGameActions } from "../zustands/useGameStore";
import { useQuestionActions } from "../zustands/useQuestionStore";
import { useRoomStore } from "../zustands/useRoomStore";
import { FetchedStatus, PlayerStatus } from "../types/enum/player_status";

export default function useGameController() {
  const { setShowPicture } = useGameActions();
  const { goToNextQuestion } = useQuestionActions();
  const player = useRoomStore((s) => s.player);
  const updatePlayerStats = useRoomStore((s) => s.updatePlayerStats);
  const setLastChat = useRoomStore((s) => s.setLastChat);

  const clearPlayerStatus = () => {
    // Status reset happens only for an active local player.
    if (!player) return;
    // Prepare the player for the next round/question lifecycle.
    updatePlayerStats({
      ...player,
      playerStatus: PlayerStatus.waiting,
      fetchedStatus: FetchedStatus.fetching,
    });
  };

  const handleGoToNextQuestion = () => {
    // Guard against room/controller calls before player is initialized.
    if (!player) return;
    // Reset round-related player state before moving forward.
    clearPlayerStatus();
    // Clear carry-over chat so the next round starts clean.
    setLastChat({ message: "", senderId: "" });
    // Advance question index/state in the question store.
    goToNextQuestion();
  };

  const showPicture = () => {
    // Toggle picture reveal on.
    setShowPicture(true);
  };

  const hidePicture = () => {
    // Toggle picture reveal off.
    setShowPicture(false);
  };

  return { handleGoToNextQuestion, showPicture, hidePicture };
}
