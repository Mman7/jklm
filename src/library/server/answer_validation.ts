import { alertPlayerCorrect } from "@/src/library/server/ably";
import { addScore as addScoreToDatabase } from "@/src/library/server/database";
import {
  AnswerValidationRequest,
  AnswerValidationResponse,
} from "@/src/types/answer_validation";
import { AnswerComparator, findAnswer } from "@/src/utils/question_utils";

export async function validateAnswerSubmission(
  request: AnswerValidationRequest,
): Promise<AnswerValidationResponse> {
  const { questionHash, answerSubmit, playerId, roomId } = request;

  const answerInStore: string = await findAnswer(questionHash);
  const isCorrect = await AnswerComparator(answerInStore, answerSubmit);

  let score: number | undefined;

  if (isCorrect) {
    score = await addScoreToDatabase(playerId, roomId, questionHash);
    await alertPlayerCorrect(playerId, roomId);
  }

  return {
    correct: isCorrect,
    score,
  };
}
