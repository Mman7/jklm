import { AnswerComparator, findAnswer } from "@/src/utils/question_utils";

interface AnswerValidationRequest {
  playerId: string;
  channelName: string;
  questionHash: string;
  answerSubmit: string;
}
export async function POST(req: Request) {
  const body = await req.json();
  const { questionHash, answerSubmit }: AnswerValidationRequest = body;
  const answerInStore = await findAnswer(questionHash);
  const isCorrect = await AnswerComparator(answerInStore, answerSubmit);

  if (isCorrect) {
    //TODO if correct update database room score data
    // Do something when answer is correct
    // e.g., update score, log success, etc.
  }

  return Response.json({ correct: isCorrect });
}
