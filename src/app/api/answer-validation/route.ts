import { alertPlayerCorrect } from "@/src/library/server/ably";
import { addScore as addScoreToDatabase } from "@/src/library/server/database";
import { AnswerComparator, findAnswer } from "@/src/utils/question_utils";

export interface AnswerValidationRequest {
  playerId: string;
  roomId: string;
  questionHash: string;
  answerSubmit: string;
}

export interface AnswerValidationResponse {
  correct: boolean;
}
export async function POST(req: Request) {
  const body = await req.json();
  const {
    questionHash,
    answerSubmit,
    playerId,
    roomId,
  }: AnswerValidationRequest = body;
  const answerInStore: string = await findAnswer(questionHash);
  const isCorrect = await AnswerComparator(answerInStore, answerSubmit);

  if (isCorrect) {
    addScoreToDatabase(playerId, roomId);
    // alert player correct
    alertPlayerCorrect(playerId, roomId);
  }

  const response: AnswerValidationResponse = {
    correct: isCorrect,
  };
  return Response.json(response);
}
