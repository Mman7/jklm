export interface SyncData {
  currentQuestionHash: QuestionHashOnly;
  timer: TimerData;
}

export interface TimerData {
  totalMs: number;
  isExpired: boolean;
}
