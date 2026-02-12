import { createAblyTokenRequest } from "@/src/library/server/ably";
import { TokenRequest } from "ably";

export interface createTokenRequest {
  playerId: string;
}

// create ably token request for temporary authentication
export async function POST(request: Request) {
  const formData = await request.formData();
  const playerId = formData.get("playerId") as string;

  if (!playerId) {
    return new Response("Missing playerId", { status: 400 });
  }

  const token: TokenRequest = await createAblyTokenRequest({ playerId });

  return Response.json(token);
}
