import useGame from "../zustands/useGameStore";
import useQuestion from "../zustands/useQuestionStore";
import useRoom from "../zustands/useRoomStore";
import { PlayerStatus } from "../types/enum/player_status";

export default function useGameController() {
  const { setShowPicture } = useGame();
  const { goToNextQuestion } = useQuestion();
  const { player, updatePlayerStats } = useRoom();

  const clearPlayerStatus = () => {
    if (!player) return;
    updatePlayerStats({
      ...player,
      status: PlayerStatus.waiting,
    });
  };

  const handleGoToNextQuestion = () => {
    if (!player) return;
    clearPlayerStatus();
    goToNextQuestion();
  };

  const showPicture = () => {
    setShowPicture(true);
  };

  const hidePicture = () => {
    setShowPicture(false);
  };

  return { handleGoToNextQuestion, showPicture, hidePicture };
}
