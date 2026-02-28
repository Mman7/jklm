import { createTokenRequest } from "@/src/app/api/ably-token/route";
import { ServerEvent } from "@/src/types/enum/server_events";
import { QuestionHashOnly } from "@/src/types/question";
import Ably, { TokenRequest } from "ably";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

// Server-side API key used only by Ably REST operations.
const ABLY_API_KEY = process.env.ABLY_API_KEY;

// Instantiate the Ably Rest client with your full API key on the server
const ably = new Ably.Rest({ key: ABLY_API_KEY });

// Function to create a TokenRequest
export async function createAblyTokenRequest({ playerId }: createTokenRequest) {
  try {
    // Mint a signed token request bound to this player identity.
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
  // Token is invalid once its expiry timestamp is in the past.
  return tokenDetails.expires < Date.now();
}

// alert player correct answer
export function alertPlayerCorrect(playerId: string, roomId: string) {
  // Publish room-scoped gameplay event.
  const channel = ably.channels.get(`room-${roomId}`);
  channel.publish("events", {
    text: ServerEvent.PlayerAnsweredCorrectly,
    playerId,
    timestamp: Date.now(),
  });
}

export function noticeRoomNewQuestion(
  roomId: string,
  questionHash: QuestionHashOnly[],
) {
  // Broadcast next question hash payload to all room subscribers.
  const channel = ably.channels.get(`room-${roomId}`);
  channel.publish("events", {
    text: ServerEvent.NewQuestion,
    questionHash,
    timestamp: Date.now(),
  });
}

export const noticeRoomPlayerWinner = (roomId: string, playerId: string) => {
  // Announce winner for current round/session.
  const channel = ably.channels.get(`room-${roomId}`);
  channel.publish("events", {
    text: ServerEvent.PlayerWinner,
    playerId,
    timestamp: Date.now(),
  });
};
