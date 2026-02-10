//TODO implement database interactions
import { createClient } from "redis";
import dotenv from "dotenv";
import { Room } from "@/src/app/types/room";
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

export const getRoomById = async (id: string) => {
  const result = (await client.json.get(`room-${id}`)) as Room | null;
  return result;
};
