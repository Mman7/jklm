import { ServerEvent } from "./enum/server_events";
import type { QuestionHashOnly } from "./question";

export interface NewQuestionEvent {
  type: ServerEvent.NewQuestion;
  questionHashs: QuestionHashOnly[];
  round: number;
  timestamp: number;
}

export interface PlayerWinnerEvent {
  type: ServerEvent.PlayerWinner;
  playerId: string;
  timestamp: number;
}

export interface PlayerAnsweredCorrectlyEvent {
  type: ServerEvent.PlayerAnsweredCorrectly;
  playerId: string;
  timestamp: number;
}

export type EventType =
  | NewQuestionEvent
  | PlayerWinnerEvent
  | PlayerAnsweredCorrectlyEvent;
