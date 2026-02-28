import { getRandomQuestions } from "@/src/utils/question_utils";

export function POST() {
  const question = getRandomQuestions(15);
  return Response.json(question);
}
