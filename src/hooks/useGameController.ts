import useGame from "../zustands/useGameStore";
import useQuestion from "../zustands/useQuestionStore";
import useRoom from "../zustands/useRoomStore";
import { FetchedStatus, PlayerStatus } from "../types/enum/player_status";

export default function useGameController() {
  const { setShowPicture } = useGame();
  const { goToNextQuestion } = useQuestion();
  const { player, updatePlayerStats, setLastChat } = useRoom();

  const clearPlayerStatus = () => {
    if (!player) return;
    updatePlayerStats({
      ...player,
      playerStatus: PlayerStatus.waiting,
      fetchedStatus: FetchedStatus.fetching,
    });
  };

  const handleGoToNextQuestion = () => {
    if (!player) return;
    clearPlayerStatus();
    setLastChat({ message: "", senderId: "" });
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
