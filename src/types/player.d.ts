export interface Player {
  name: string;
  playerId: string;
  score: number;
  lastChat: string;
  status: Status;
}

export interface UpdatedPlayerScore {
  playerId: string;
  score: number;
}
