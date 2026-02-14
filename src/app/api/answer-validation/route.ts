import { addScore } from "@/src/library/server/database";
import { AnswerComparator, findAnswer } from "@/src/utils/question_utils";

interface AnswerValidationRequest {
  playerId: string;
  roomId: string;
  questionHash: string;
  answerSubmit: string;
}
export async function POST(req: Request) {
  const body = await req.json();
  const {
    questionHash,
    answerSubmit,
    playerId,
    roomId,
  }: AnswerValidationRequest = body;
  const answerInStore = await findAnswer(questionHash);
  const isCorrect = await AnswerComparator(answerInStore, answerSubmit);

  if (isCorrect) {
    addScore(playerId, roomId);
  }

  return Response.json({ correct: isCorrect });
}
