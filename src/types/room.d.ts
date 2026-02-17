import { Question } from "./question";

export interface Room {
  createdAt: Date;
  hostId: string;
  id: string;
  currentQuestion?: Question;
  questionList?: Question[];
  scores?: Record<string, number>;
}
