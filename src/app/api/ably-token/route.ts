import { createAblyTokenRequest } from "@/src/library/server/ably";

interface requestBody {
  playerName: string;
}

// create ably token request for temporary authentication
export async function POST(request: Request) {
  const body = request.json();
  const { playerName }: requestBody = await body;
  const token = await createAblyTokenRequest(playerName);
  return new Response(JSON.stringify(token), {
    headers: { "Content-Type": "application/json" },
  });
}
