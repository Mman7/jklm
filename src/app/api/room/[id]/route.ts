import { Room } from "@/src/types/room";
import {
  deleteRoomById,
  getRoomById,
  updateRoom,
  replaceRoomQuestionList,
} from "@/src/library/server/database";
import { getRandomQuestions } from "@/src/utils/question_utils";
import type { QuestionHashOnly } from "@/src/types/question";

const ROUND_QUESTION_COUNT = 15;
const DEFAULT_TARGET_SCORE = 100;
const DEFAULT_QUESTION_DURATION_SECONDS = 20;

type UpdateRoomSettingsRequest = {
  playerId: string;
  targetScore?: number;
  questionDurationSeconds?: number;
};

const parseIntInRange = (
  value: unknown,
  min: number,
  max: number,
): number | null => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const integerValue = Math.trunc(parsed);
  if (integerValue < min || integerValue > max) return null;
  return integerValue;
};

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

export async function PATCH(request: Request, { params }: any) {
  const { id } = await params;
  const body = (await request.json()) as UpdateRoomSettingsRequest;
  const { playerId, targetScore, questionDurationSeconds } = body;

  if (!playerId) {
    return new Response("Player ID is required", { status: 400 });
  }

  const room = await getRoomById(id);
  if (!room) {
    return new Response("Room not found", { status: 404 });
  }

  if (room.hostId !== playerId) {
    return new Response("Only host can update room settings", { status: 403 });
  }

  const parsedTargetScore =
    targetScore === undefined
      ? (room.targetScore ?? DEFAULT_TARGET_SCORE)
      : parseIntInRange(targetScore, 1, 1000);

  const parsedQuestionDuration =
    questionDurationSeconds === undefined
      ? (room.questionDurationSeconds ?? DEFAULT_QUESTION_DURATION_SECONDS)
      : parseIntInRange(questionDurationSeconds, 5, 180);

  if (parsedTargetScore === null) {
    return new Response("targetScore must be an integer between 1 and 1000", {
      status: 400,
    });
  }

  if (parsedQuestionDuration === null) {
    return new Response(
      "questionDurationSeconds must be an integer between 5 and 180",
      {
        status: 400,
      },
    );
  }

  const updatedRoom: Room = {
    ...room,
    targetScore: parsedTargetScore,
    questionDurationSeconds: parsedQuestionDuration,
  };

  await updateRoom(id, updatedRoom);
  return new Response(JSON.stringify(updatedRoom), { status: 200 });
}
