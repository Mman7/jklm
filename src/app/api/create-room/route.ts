import { getRoomById } from "@/src/library/server/database";
import { generateUID } from "@/src/utils/uuid";
import { Room } from "../../types/room";
import { TokenRequest } from "ably";
import { isTokenExpired } from "@/src/library/server/ably";

export interface CreateRoomRequest {
  token: TokenRequest;
  uuid: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { token, uuid }: CreateRoomRequest = body;
  if (!token.mac)
    return new Response("Player token is required", { status: 400 });

  if (isTokenExpired(token))
    return new Response("Player token is expired", { status: 400 });

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
    hostId: uuid,
  };
  return new Response(JSON.stringify(roomData), { status: 201 });
}
