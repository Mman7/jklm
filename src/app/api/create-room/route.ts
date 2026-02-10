import { getRoomById } from "@/src/library/server/database";
import { generateUID } from "@/src/utils/uuid";
import { Room } from "../../types/room";

//TODO implement playerToken and use it to identify room host

export async function POST(request: Request) {
  // const body = await request.json();
  // const { playerToken } = body;
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
  };
  return new Response(JSON.stringify(roomData), { status: 201 });
}
