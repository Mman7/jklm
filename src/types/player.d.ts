import { FetchedStatus } from "./enum/player_status";

export interface Player {
  name: string;
  playerId: string;
  score: number;
  lastChat: string;
  playerStatus: PlayerStatus;
  fetchedStatus: FetchedStatus;
}

export interface PlayerScore {
  playerId: string;
  score: number;
}
