import {
  processCorrectAnswer,
  validateAnswerSubmission,
} from "@/src/library/server/answer_validation";
import { AnswerValidationRequest } from "@/src/types/answer_validation";

export async function POST(req: Request) {
  const body = await req.json();
  const request: AnswerValidationRequest = body;

  // Edge endpoint sends this header only after it has already validated correctness.
  const isPrevalidated = req.headers.get("x-answer-prevalidated") === "true";

  const response = isPrevalidated
    ? await processCorrectAnswer(request)
    : await validateAnswerSubmission(request);

  return Response.json(response);
}
