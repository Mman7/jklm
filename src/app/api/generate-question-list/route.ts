import { getRandomQuestions } from "@/src/utils/question_utils";

export function POST() {
  // TODO get questions by topic
  const question = getRandomQuestions();
  return Response.json(question);
}
