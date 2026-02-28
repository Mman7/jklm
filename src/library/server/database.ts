import { createClient } from "redis";
import dotenv from "dotenv";
import { Room } from "@/src/types/room";
import { noticeRoomPlayerWinner } from "./ably";
import { QuestionHashOnly } from "@/src/types/question";
dotenv.config({ path: ".env" });

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

// Helper function to safely parse Redis JSON data into a Room object
const normalizeRoom = (value: unknown): Room | null => {
  // Return null if the value is falsy (empty, null, undefined)
  if (!value) return null;
  // Attempt to parse string data into a JSON object
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Room;
    } catch {
      // Return null if parsing fails (invalid JSON)
      return null;
    }
  }

  // Return the value directly if it is already an object (assuming type safety handles strict typing)
  return value as Room;
};

/**
 * Retrieves a room by its unique ID.
 * @param id - The unique identifier of the room.
 * @returns The room data or null if not found.
 */
export const getRoomById = async (id: string): Promise<Room | null> => {
  const key = `room-${id}`;
  const result = normalizeRoom(await client.json.get(key));
  // Reset the key's Time-To-Live (TTL) to 3 hours to prevent accidental deletion
  if (result) {
    await client.expire(key, 10800);
  }
  return result;
};

// clear room scores
export const clearRoomScores = async (roomId: string) => {
  // Fetch the current room data
  const data = await getRoomById(roomId);
  // If room does not exist, exit early
  if (!data) return;
  const room = data;
  // Reset the scores object to empty
  room.scores = {};
  // Persist the clean room state back to Redis
  await updateRoom(roomId, room);
};

// TODO add score depends on places
export const addScore = async (
  playerId: string,
  roomId: string,
): Promise<number | undefined> => {
  // Fetch the current room data
  const data = await getRoomById(roomId);
  if (!data) return;

  const room = data;
  // Initialize scores object if it doesn't exist
  room.scores ??= {};
  // Increment player score by 10 points
  room.scores[playerId] = (room.scores[playerId] ?? 0) + 10;

  // Check if player score reaches the winning threshold (100)
  if (room.scores[playerId] >= 100) {
    // Notify the player via Ably
    noticeRoomPlayerWinner(roomId, playerId);
    // Clear all scores (win condition logic)
    await clearRoomScores(roomId);
    return room.scores[playerId];
  }

  // Save updated scores to Redis
  await updateRoom(roomId, room);
  return room.scores[playerId];
};

export const getPlayerScore = async (
  playerId: string,
  roomId: string,
): Promise<number | undefined> => {
  // Fetch the room data
  const room = await getRoomById(roomId);
  if (!room) return undefined;
  // Return player score or 0 if they don't have a score yet
  return room.scores?.[playerId] ?? 0;
};

export const updateRoom = async (roomId: string, room: Room) => {
  // Save the room object to Redis at the root key path ($)
  await client.json.set(`room-${roomId}`, "$", room as any);
  // Ensure the room stays alive for 3 hours
  await client.expire(`room-${roomId}`, 10800);
};

export const deleteRoomById = async (roomId: string): Promise<boolean> => {
  const deletedCount = await client.del(`room-${roomId}`);
  // Return true if one or more keys were deleted
  return deletedCount > 0;
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
  const key: string = `room-${room.id}`;
  // setup options
  // Set key with 30 minutes expiry (3 hours)
  await client.json.set(key, "$", room as any);
  await client.expire(key, 10800);
  console.log(`Key "${key}" set with 3 hours expiry.`);
};

export const getAllRooms = async (): Promise<Room[]> => {
  // Retrieve all keys matching the "room-*" pattern (WARNING: Can be slow on large datasets)
  const keys = await client.keys("room-*");
  if (!keys.length) return [];

  // Process all matching keys concurrently
  const rooms = await Promise.all(
    keys.map(async (key) => {
      // get object at root (not array)
      const room = await client.json.get(key);
      return normalizeRoom(room);
    }),
  );
  // Filter out any null values returned by normalizeRoom (e.g., corrupted data)
  const filteredRooms = rooms.filter((room): room is Room => room !== null);

  return filteredRooms;
};
