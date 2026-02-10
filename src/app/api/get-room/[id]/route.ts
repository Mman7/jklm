import { Room } from "@/src/app/types/room";
import { getRoomById } from "@/src/library/server/database";
import { NextRequest } from "next/server";

// return room data by id
export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  const { id } = await context.params;
  const roomData: Room | null = await getRoomById(id);
  if (roomData === null) return new Response("Room not found", { status: 404 });
  return new Response(JSON.stringify(roomData), { status: 200 });
}
