import { createClient } from "redis";
import dotenv from "dotenv";
import { Room } from "@/src/types/room";
import { noticeRoomPlayerWinner } from "./ably";
dotenv.config({ path: ".env" });

const PASSWORD = process.env.DATABASE_PASSWORD;
const client = createClient({
  username: "default",
  password: PASSWORD,
  socket: {
    host: "redis-17443.c295.ap-southeast-1-1.ec2.cloud.redislabs.com",
    port: 17443,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

const normalizeRoom = (value: unknown): Room | null => {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Room;
    } catch {
      return null;
    }
  }

  return value as Room;
};

export const getRoomById = async (id: string): Promise<Room | null> => {
  const key = `room-${id}`;
  const result = normalizeRoom(await client.json.get(key));
  if (result) {
    await client.expire(key, 10800); // reset TTL to 5 min
  }
  return result;
};

// TODO add score depends on places
export const addScore = async (playerId: string, roomId: string) => {
  const data = await getRoomById(roomId);
  if (!data) return;

  const room = data;
  room.scores ??= {};
  // if has player score add to it, else create new player score
  room.scores[playerId] = (room.scores[playerId] ?? 0) + 10;
  if (room.scores[playerId] > 100) {
    noticeRoomPlayerWinner(roomId, playerId);
  }
  await updateRoom(roomId, room);
  updateRoom(roomId, room);
};

export const updateRoom = async (roomId: string, room: Room) => {
  await client.json.set(`room-${roomId}`, "$", room as any);
  await client.expire(`room-${roomId}`, 10800);
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
  const keys = await client.keys("room-*");
  if (!keys.length) return [];

  const rooms = await Promise.all(
    keys.map(async (key) => {
      // get object at root (not array)
      const room = await client.json.get(key);
      return normalizeRoom(room);
    }),
  );
  const filteredRooms = rooms.filter((room): room is Room => room !== null);

  return filteredRooms;
};
