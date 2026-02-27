import { Room } from "@/src/types/room";
import { deleteRoomById, getRoomById } from "@/src/library/server/database";

// return room data by id
export async function GET(request: Request, { params }: any) {
  // this await is important, do not remove it
  const { id } = await params;
  const roomData: Room | null = await getRoomById(id);
  if (roomData === null) return new Response("Room not found", { status: 404 });
  return new Response(JSON.stringify(roomData), { status: 200 });
}

export async function DELETE(request: Request, { params }: any) {
  const { id } = await params;
  const deleted = await deleteRoomById(id);

  if (!deleted) {
    return new Response("Room not found", { status: 404 });
  }

  return new Response("Room deleted", { status: 200 });
}
