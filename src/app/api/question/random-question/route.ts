import { getRandomQuestions } from "@/src/utils/question_utils";

export function POST() {
  const question = getRandomQuestions();
  return Response.json(question);
}
