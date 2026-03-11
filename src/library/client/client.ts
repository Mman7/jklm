import { EventRequestBody } from "@/src/app/api/events/route";
import { CreateRoomRequest } from "@/src/app/api/room/route";
import { ServerEvent } from "@/src/types/enum/server_events";
import { Question, QuestionHashOnly } from "@/src/types/question";
import { Room } from "@/src/types/room";
import { generateUID } from "@/src/utils/uuid";
import _ from "lodash";
import ky from "ky";

export const hostRoom = async ({
  playerId,
}: {
  playerId: string;
}): Promise<Room> => {
  // Ask server to create a new room owned by this player.
  const req: CreateRoomRequest = { playerId: playerId };
  return ky.post("/api/room", { json: req }).json<Room>();
};

export const generateNameWithUUID = (name: string): string => {
  // Create a display name with a stable uniqueness suffix.
  return `${name}-${generateUID()}`;
};

export const getRoom = (roomId: string): Promise<Room> => {
  // Fetch one room by id.
  return ky.get(`/api/room/${roomId}`).json<Room>();
};

export const updateRoomSettings = (
  roomId: string,
  {
    playerId,
    targetScore,
    questionDurationSeconds,
  }: {
    playerId: string;
    targetScore: number;
    questionDurationSeconds: number;
  },
): Promise<Room> => {
  return ky
    .patch(`/api/room/${roomId}`, {
      json: {
        playerId,
        targetScore,
        questionDurationSeconds,
      },
    })
    .json<Room>();
};

export const getAllRooms = (): Promise<Room[]> => {
  // Fetch public/available room list.
  return ky.get("/api/room/all").json<Room[]>();
};

export const noticeServerNewQuestion = (roomId: string) => {
  // Trigger server-side new-question event fan-out.
  const req: EventRequestBody = {
    type: ServerEvent.NewQuestion,
    roomId,
  };
  return ky.post("/api/events", { json: req });
};

export const getQuestions = (
  questions: QuestionHashOnly[],
  questionDurationSeconds?: number,
): Promise<Question[]> => {
  // Resolve all question payloads in smaller chunks to avoid oversized
  // serverless responses on providers like Netlify.
  const BATCH_SIZE = 5;

  return (async () => {
    // Extract hashes from question list.
    const hashes = questions.map((question) => question.hash);

    if (hashes.length === 0) return [];
    const hashChunks = _.chunk(hashes, BATCH_SIZE);

    // Fetch question details in batches and merge results.
    const chunkResults = await Promise.all(
      hashChunks.map((chunkHashes) =>
        ky
          .post("/api/question/batch", {
            json: {
              hashes: chunkHashes,
              questionDurationSeconds,
            },
          })
          .json<Question[]>(),
      ),
    );

    const merged = chunkResults.flat();
    // Filter out any failed question loads (e.g. invalid hash) and return.
    return merged.filter((question): question is Question => question !== null);
  })();
};

export const getAnswer = (questionHash: string): Promise<string> => {
  // Retrieve answer string for validation/comparison.
  return ky.get(`/api/question/${questionHash}/answer`).json<string>();
};
