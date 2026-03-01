export interface AnswerValidationRequest {
  playerId: string;
  roomId: string;
  questionHash: string;
  answerSubmit: string;
}

export interface AnswerValidationResponse {
  correct: boolean;
  score?: number;
}
