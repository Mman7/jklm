import { processCorrectAnswer } from "@/src/library/server/answer_validation";
import { AnswerValidationRequest } from "@/src/types/answer_validation";

export async function POST(req: Request) {
  const body = await req.json();
  const request: AnswerValidationRequest = body;
  const response = await processCorrectAnswer(request);
  return Response.json(response);
}
