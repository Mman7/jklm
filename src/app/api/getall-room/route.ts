import { getAllRooms } from "@/src/library/server/database";

export async function GET() {
  const rooms = await getAllRooms();
  return new Response(JSON.stringify(rooms), {
    headers: { "Content-Type": "application/json" },
  });
}
