import { Room } from "@/src/types/room";
import {
  deleteRoomById,
  getRoomById,
  replaceRoomQuestionList,
} from "@/src/library/server/database";
import { getRandomQuestions } from "@/src/utils/question_utils";
import type { QuestionHashOnly } from "@/src/types/question";

const ROUND_QUESTION_COUNT = 15;

const normalizeQuestionList = (
  currentList: QuestionHashOnly[],
): QuestionHashOnly[] => {
  if (currentList.length >= ROUND_QUESTION_COUNT) {
    return currentList;
  }

  const mergedList = [...currentList];
  const seenHashes = new Set(mergedList.map((question) => question.hash));

  let attempts = 0;
  while (mergedList.length < ROUND_QUESTION_COUNT && attempts < 10) {
    attempts += 1;

    const candidates = getRandomQuestions(ROUND_QUESTION_COUNT);
    for (const candidate of candidates) {
      if (seenHashes.has(candidate.hash)) continue;
      seenHashes.add(candidate.hash);
      mergedList.push(candidate);

      if (mergedList.length >= ROUND_QUESTION_COUNT) {
        break;
      }
    }
  }

  return mergedList;
};

// return room data by id
export async function GET(request: Request, { params }: any) {
  // this await is important, do not remove it
  const { id } = await params;
  let roomData: Room | null = await getRoomById(id);
  if (roomData === null) return new Response("Room not found", { status: 404 });

  const existingQuestionList = roomData.questionList ?? [];
  const normalizedQuestionList = normalizeQuestionList(existingQuestionList);

  if (normalizedQuestionList.length !== existingQuestionList.length) {
    const updatedRoom = await replaceRoomQuestionList(
      id,
      normalizedQuestionList,
    );
    if (updatedRoom) {
      roomData = updatedRoom;
    } else {
      roomData = {
        ...roomData,
        questionList: normalizedQuestionList,
      };
    }
  }

  return new Response(JSON.stringify(roomData), { status: 200 });
}

export async function DELETE(request: Request, { params }: any) {
  const { id } = await params;
  const deleted = await deleteRoomById(id);

  if (!deleted) {
    return new Response("Room not found", { status: 404 });
  }

  return new Response("Room deleted", { status: 200 });
}
