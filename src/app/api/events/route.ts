import { noticeUserNewQuestion } from "@/src/library/server/ably";
import { ServerEvent } from "@/src/types/enum/server_events";
import { QuestionHashOnly } from "@/src/types/question";
import { getRandomQuestions } from "@/src/utils/question_utils";

export interface EventRequestBody {
  type: ServerEvent.newQuestion;
  roomId: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as EventRequestBody;
  const { type, roomId } = body;
  console.log("Received event:", type, "for room:", roomId);
  if (type === ServerEvent.newQuestion) {
    const questionHashList: QuestionHashOnly[] = getRandomQuestions();
    noticeUserNewQuestion(roomId, questionHashList);
  }
  return new Response("Event triggered", { status: 200 });
}
