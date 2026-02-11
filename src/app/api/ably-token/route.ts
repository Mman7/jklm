import { createAblyTokenRequest } from "@/src/library/server/ably";
import { TokenRequest } from "ably";

export interface createTokenRequest {
  uuid: string;
}

// create ably token request for temporary authentication
export async function POST(request: Request) {
  const body = request.json();
  const { uuid }: createTokenRequest = await body;
  const token: TokenRequest = await createAblyTokenRequest({ uuid });
  return new Response(JSON.stringify(token), {
    headers: { "Content-Type": "application/json" },
  });
}
