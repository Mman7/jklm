import { createRoom, getRoomById } from "@/src/library/server/database";
import { generateUID } from "@/src/utils/uuid";
import { Room } from "../../../types/room";

export interface CreateRoomRequest {
  playerId: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { playerId }: CreateRoomRequest = body;
  if (!playerId)
    return new Response("Player uuid is required", { status: 400 });

  let id = generateUID();
  let room: Room | null = await getRoomById(id);

  // if room with id exists, generate a new id
  while (room) {
    id = generateUID();
    room = await getRoomById(id);
  }

  // create new room
  const roomData: Room = {
    id: id,
    scores: {},
    createdAt: new Date(),
    hostId: playerId,
  };
  // database create Room
  createRoom(roomData);
  return new Response(JSON.stringify(roomData), { status: 201 });
}
