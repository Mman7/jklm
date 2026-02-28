import { noticeRoomNewQuestion } from "@/src/library/server/ably";
import { replaceRoomQuestionList } from "@/src/library/server/database";
import { ServerEvent } from "@/src/types/enum/server_events";
import { QuestionHashOnly } from "@/src/types/question";
import { getRandomQuestions } from "@/src/utils/question_utils";

export interface EventRequestBody {
  type: ServerEvent.NewQuestion;
  roomId: string;
  playerId?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as EventRequestBody;
  const { type, roomId } = body;
  console.log("Received event:", type, "for room:", roomId);

  if (type === ServerEvent.NewQuestion) {
    const questionHashList: QuestionHashOnly[] = getRandomQuestions(15);
    const updatedRoom = await replaceRoomQuestionList(roomId, questionHashList);

    if (!updatedRoom) {
      return new Response("Room not found", { status: 404 });
    }

    noticeRoomNewQuestion(roomId, questionHashList);
  }

  return new Response("Event triggered", { status: 200 });
}
