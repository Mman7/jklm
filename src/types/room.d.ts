import { QuestionHashOnly } from "./question";

export interface Room {
  createdAt: Date;
  hostId: string;
  id: string;
  targetScore?: number;
  questionDurationSeconds?: number;
  currentQuestion?: QuestionHashOnly;
  questionList?: QuestionHashOnly[];
  scores?: Record<string, number>;
}
