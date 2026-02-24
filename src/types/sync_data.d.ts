export interface SyncData {
  currentQuestionHash: QuestionHashOnly;
  timer: TimerData;
}

export interface TimerData {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}
