import { createClient } from "redis";
import dotenv from "dotenv";
import { Room } from "@/src/types/room";
import { noticeRoomPlayerWinner } from "./ably";
import { QuestionHashOnly } from "@/src/types/question";
dotenv.config({ path: ".env" });

const ROUND_TTL_SECONDS = 60 * 10;
const ROOM_TTL_SECONDS = 10800;

// Room "document" key (hash): stable room state fields.
const getRoomMetaKey = (roomId: string) => `room:${roomId}:meta`;
// Room questions key (hash): index -> questionHash, kept separate for frequent updates.
const getRoomQuestionsKey = (roomId: string) => `room:${roomId}:questions`;
// Pattern used to list all room documents.
const getAllRoomMetaPattern = () => "room:*:meta";

// Scoreboard key (hash): playerId -> score.
const getRoomScoresKey = (roomId: string) => `room:${roomId}:scores`;

// Per-round key used to assign answering place atomically via INCR.
const getRoundCounterKey = (roomId: string, questionHash: string) =>
  `room:${roomId}:round:${questionHash}:counter`;
// Per-round/player dedupe key used with SET NX to avoid double scoring.
const getRoundAnsweredKey = (
  roomId: string,
  questionHash: string,
  playerId: string,
) => `room:${roomId}:round:${questionHash}:answered:${playerId}`;

// Pattern for all keys belonging to a room (meta, scores, round keys).
const getRoomScopedPattern = (roomId: string) => `room:${roomId}:*`;

// Place-based scoring table.
const getScoreByPlace = (place: number): number => {
  if (place === 1) return 10;
  if (place === 2) return 5;
  return 3;
};

const normalizeDate = (value: unknown): Date => {
  if (value instanceof Date) return value;

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const parseQuestionHashOnly = (
  value?: string,
): QuestionHashOnly | undefined => {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as QuestionHashOnly;
    return parsed?.hash ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const toQuestionsHashPayload = (
  questionList?: QuestionHashOnly[],
): Record<string, string> => {
  if (!questionList || questionList.length === 0) {
    return {};
  }

  return Object.fromEntries(
    questionList.map((question, index) => [String(index), question.hash]),
  );
};

const fromQuestionsHashPayload = (
  payload: Record<string, string>,
): QuestionHashOnly[] => {
  const orderedEntries = Object.entries(payload)
    .map(([index, hash]) => ({ index: Number(index), hash }))
    .filter(
      ({ index, hash }) => Number.isInteger(index) && index >= 0 && !!hash,
    )
    .sort((a, b) => a.index - b.index);

  return orderedEntries.map(({ hash }) => ({ hash }));
};

// Serialize Room shape into flat hash fields.
const toRoomHashPayload = (room: Room): Record<string, string> => ({
  id: room.id,
  hostId: room.hostId,
  createdAt: normalizeDate(room.createdAt).toISOString(),
  currentQuestion: room.currentQuestion
    ? JSON.stringify(room.currentQuestion)
    : "",
});

// Deserialize hash fields back to Room shape.
const fromRoomHashPayload = (payload: Record<string, string>): Room | null => {
  if (!payload.id || !payload.hostId || !payload.createdAt) {
    return null;
  }

  return {
    id: payload.id,
    hostId: payload.hostId,
    createdAt: normalizeDate(payload.createdAt),
    currentQuestion: parseQuestionHashOnly(payload.currentQuestion),
  };
};

// Hydrate question list from dedicated questions hash into returned room object.
const hydrateRoomQuestions = async (room: Room): Promise<Room> => {
  const questionEntries = await client.hGetAll(getRoomQuestionsKey(room.id));
  return {
    ...room,
    questionList: fromQuestionsHashPayload(questionEntries),
  };
};

// Hydrate scores from dedicated score hash into returned room object.
const hydrateRoomScores = async (room: Room): Promise<Room> => {
  const scoreEntries = await client.hGetAll(getRoomScoresKey(room.id));
  const scores = Object.fromEntries(
    Object.entries(scoreEntries).map(([playerId, score]) => [
      playerId,
      Number(score),
    ]),
  );

  return {
    ...room,
    scores,
  };
};

// Initialize Redis client with credentials from environment variables
const PASSWORD = process.env.DATABASE_PASSWORD;
const client = createClient({
  username: "default",
  password: PASSWORD,
  socket: {
    host: "redis-17443.c295.ap-southeast-1-1.ec2.cloud.redislabs.com",
    port: 17443,
  },
});

// Log connection errors to console
client.on("error", (err) => console.log("Redis Client Error", err));

// Attempt to connect to the Redis server immediately
await client.connect();

/**
 * Retrieves a room by its unique ID.
 * @param id - The unique identifier of the room.
 * @returns The room data or null if not found.
 */
export const getRoomById = async (id: string): Promise<Room | null> => {
  const metaKey = getRoomMetaKey(id);
  const payload = await client.hGetAll(metaKey);
  const roomFromHash = fromRoomHashPayload(payload);

  if (roomFromHash) {
    await client.expire(metaKey, ROOM_TTL_SECONDS);
    await client.expire(getRoomQuestionsKey(id), ROOM_TTL_SECONDS);
    const roomWithQuestions = await hydrateRoomQuestions(roomFromHash);
    return hydrateRoomScores(roomWithQuestions);
  }

  return null;
};

// clear room scores
export const clearRoomScores = async (roomId: string) => {
  await client.del(getRoomScoresKey(roomId));
};

export const addScore = async (
  playerId: string,
  roomId: string,
  questionHash: string,
): Promise<number | undefined> => {
  // De-duplicate correct submissions per player per round.
  const didMarkAnswered = await client.set(
    getRoundAnsweredKey(roomId, questionHash, playerId),
    "1",
    { NX: true, EX: ROUND_TTL_SECONDS },
  );

  if (didMarkAnswered !== "OK") {
    // Already answered this round: do not add points twice.
    const currentScore = await getPlayerScore(playerId, roomId);
    return currentScore ?? 0;
  }

  // Atomic place assignment among all concurrent correct answers.
  const place = await client.incr(getRoundCounterKey(roomId, questionHash));
  await client.expire(
    getRoundCounterKey(roomId, questionHash),
    ROUND_TTL_SECONDS,
  );

  const scoreToAdd = getScoreByPlace(place);
  const updatedScore = await client.hIncrBy(
    getRoomScoresKey(roomId),
    playerId,
    scoreToAdd,
  );

  // Check if player score reaches the winning threshold (100)
  if (updatedScore >= 100) {
    // Notify the player via Ably
    noticeRoomPlayerWinner(roomId, playerId);
    // Clear all scores (win condition logic)
    await clearRoomScores(roomId);
    return updatedScore;
  }

  return updatedScore;
};

export const getPlayerScore = async (
  playerId: string,
  roomId: string,
): Promise<number | undefined> => {
  const score = await client.hGet(getRoomScoresKey(roomId), playerId);
  if (score === null) return 0;
  return Number(score);
};

export const updateRoom = async (roomId: string, room: Room) => {
  const metaKey = getRoomMetaKey(roomId);
  const questionsKey = getRoomQuestionsKey(roomId);
  await client.hSet(metaKey, toRoomHashPayload(room));
  await client.expire(metaKey, ROOM_TTL_SECONDS);

  const questionsPayload = toQuestionsHashPayload(room.questionList);
  await client.del(questionsKey);
  if (Object.keys(questionsPayload).length > 0) {
    await client.hSet(questionsKey, questionsPayload);
    await client.expire(questionsKey, ROOM_TTL_SECONDS);
  }
};

export const deleteRoomById = async (roomId: string): Promise<boolean> => {
  const relatedKeys = await client.keys(getRoomScopedPattern(roomId));
  if (relatedKeys.length > 0) {
    await client.del(relatedKeys);
  }

  // Return true if one or more room-scoped keys were deleted
  return relatedKeys.length > 0;
};

export const replaceRoomQuestionList = async (
  roomId: string,
  questionList: QuestionHashOnly[],
): Promise<Room | null> => {
  // Fetch the existing room
  const room = await getRoomById(roomId);
  if (!room) return null;

  // Update the question list and set the current question to the first item in the list
  room.questionList = questionList;
  room.currentQuestion = questionList[0] ?? undefined;

  // Persist changes
  await updateRoom(roomId, room);
  return room;
};

// Function to set a JSON key with TTL
export const createRoom = async (room: Room) => {
  const metaKey = getRoomMetaKey(room.id);
  await client.hSet(metaKey, toRoomHashPayload(room));
  await client.expire(metaKey, ROOM_TTL_SECONDS);
  console.log(`Key "${metaKey}" set with 3 hours expiry.`);
};

export const getAllRooms = async (): Promise<Room[]> => {
  // Retrieve all room meta hash keys (WARNING: Can be slow on large datasets)
  const keys = await client.keys(getAllRoomMetaPattern());
  if (!keys.length) return [];

  // Process all matching keys concurrently
  const rooms = await Promise.all(
    keys.map(async (key) => {
      const payload = await client.hGetAll(key);
      const room = fromRoomHashPayload(payload);
      if (!room) return null;
      const roomWithQuestions = await hydrateRoomQuestions(room);
      return hydrateRoomScores(roomWithQuestions);
    }),
  );

  // Filter out malformed room meta entries.
  const filteredRooms = rooms.filter((room): room is Room => room !== null);

  return filteredRooms;
};
