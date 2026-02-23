import { createTokenRequest } from "@/src/app/api/ably-token/route";
import { ServerEvent } from "@/src/types/enum/server_events";
import Ably, { TokenRequest } from "ably";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const ABLY_API_KEY = process.env.ABLY_API_KEY;

// Instantiate the Ably Rest client with your full API key on the server
const ably = new Ably.Rest({ key: ABLY_API_KEY });

// Function to create a TokenRequest
export async function createAblyTokenRequest({ playerId }: createTokenRequest) {
  try {
    const tokenRequest: TokenRequest = await ably.auth.createTokenRequest({
      clientId: playerId, // Use a specific client ID if known
      // Add other options like capabilities, timestamp, etc. if needed
    });
    return tokenRequest;
  } catch (error) {
    throw error;
  }
}
export function isTokenExpired(tokenDetails: any) {
  return tokenDetails.expires < Date.now();
}

// alert player correct answer
export function alertPlayerCorrect(playerId: string, roomId: string) {
  const channel = ably.channels.get(`room-${roomId}`);
  channel.publish("events", {
    text: ServerEvent.PlayerAnsweredCorrectly,
    playerId,
    timestamp: Date.now(),
  });
}
