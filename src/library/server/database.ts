//TODO implement database interactions
import { createClient } from "redis";
import dotenv from "dotenv";
import { Room } from "@/src/types/room";
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

export const getRoomById = async (id: string): Promise<Room | null> => {
  const key = `room-${id}`;
  const result = (await client.json.get(key)) as Room | null;
  if (result) {
    await client.expire(key, 10800); // reset TTL to 5 min
  }
  return result;
};

// TODO add score depends on places
export const addScore = async (playerId: string, roomId: string) => {
  const data = await getRoomById(roomId);
  if (!data || typeof data !== "string") return;

  const room = JSON.parse(data);
  room.scores ??= {};
  // if has player score add to it, else create new player score
  room.scores[playerId] = (room.scores[playerId] ?? 0) + 10;
  updateRoom(roomId, room);
};

export const updateRoom = async (roomId: string, room: Room) => {
  await client.json.set(`room-${roomId}`, "$", JSON.stringify(room));
  await client.expire(roomId, 10800);
};

// Function to set a JSON key with TTL
export const createRoom = async (room: Room) => {
  const key: string = `room-${room.id}`;
  // Convert JS object to JSON string
  const jsonString = JSON.stringify(room);
  // setup options
  // Set key with 30 minutes expiry (3 hours)
  await client.json.set(key, "$", jsonString);
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
      return room as unknown as Room;
    }),
  );

  return rooms;
};
