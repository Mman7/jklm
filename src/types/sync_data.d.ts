export interface SyncData {
  currentQuestionHash: QuestionHashOnly;
  timer: TimerData;
  isShowingAnswer: boolean;
}

export interface TimerData {
  totalMs: number;
  isExpired: boolean;
}

export interface SyncRequestMessage {
  type: "sync_request";
  requesterId: string;
}

export interface SyncDataMessage {
  type: "sync_data";
  requesterId: string;
  senderId: string;
  seq: number;
  sentAt: number;
  payload: SyncData;
}

export type SyncMessage = SyncRequestMessage | SyncDataMessage;
