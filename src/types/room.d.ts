import { Question, QuestionHashOnly } from "./question";

export interface Room {
  createdAt: Date;
  hostId: string;
  id: string;
  currentQuestion?: QuestionHashOnly;
  questionList?: QuestionHashOnly[];
  scores?: Record<string, number>;
}
