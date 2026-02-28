type GameJoinStatusProps = {
  hasJoinedGame: boolean;
  isGameReady: boolean;
  canJoinGame: boolean;
  onJoinGame: () => void;
};

export default function GameJoinStatus({
  hasJoinedGame,
  isGameReady,
  canJoinGame,
  onJoinGame,
}: GameJoinStatusProps) {
  if (!hasJoinedGame) {
    return (
      <button
        className="btn btn-primary btn-sm rounded-full"
        onClick={onJoinGame}
        disabled={!canJoinGame}
      >
        Join game
      </button>
    );
  }

  return (
    <h1 className="text-sm font-medium">
      {isGameReady ? "Game started" : "Waiting for 2 players to start"}
    </h1>
  );
}
