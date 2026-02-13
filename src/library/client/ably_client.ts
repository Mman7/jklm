//TODO implement ably for chat interaction
import { Player } from "@/src/types/player";
import Ably from "ably";

let ably: Ably.Realtime | undefined;
let channel: Ably.RealtimeChannel | undefined;
const joinedChannels = new Set<string>();

export function initAbly({
  roomId,
  playerId,
}: {
  roomId: string;
  playerId: string;
}) {
  ably = new Ably.Realtime({
    authUrl: "/api/ably-token",
    authMethod: "POST",
    authParams: {
      playerId: playerId,
    },
  });
  channel = ably.channels.get(`room-${roomId}`);
  joinedChannels.add(roomId);
  return channel;
}

export function sendMessage(text: string, playerId: string) {
  if (!channel) return;
  channel.publish("chat", {
    text,
    playerId,
    timestamp: Date.now(),
  });
  updateLastChat(text);
}

export function subscribeToMessages(
  onMessage: (msg: {
    text: string;
    timestamp: number;
    playerId: string;
  }) => void,
) {
  if (!channel) return;
  channel.subscribe("chat", (message) => {
    onMessage(message.data);
  });
}

export function hasJoined(channelName: string) {
  return joinedChannels.has(channelName);
}

export function enterChannel(playerProps: Player) {
  if (!channel) return;
  channel.presence.enter(playerProps);
}

export async function leaveRoom() {
  if (!channel) return;
  if (!ably) return;

  // 1️⃣ Leave presence first
  try {
    await channel.presence.leave();
  } catch {}

  // 2️⃣ Detach and WAIT
  if (channel.state === "attached" || channel.state === "attaching") {
    await new Promise<void>((resolve) => {
      channel?.once("detached", () => resolve());
      channel?.detach();
    });
  }

  // 3️⃣ Now it's safe to release
  ably.channels.release(channel.name);
}

// update last chat to persence
export function updateLastChat(message: string) {
  if (!channel) return;
  channel.presence.update(message);
}

export async function getAllPlayers() {
  if (!channel) return;
  const members = await channel.presence.get();
  return members.map((member) => ({
    clientId: member.clientId,
    ...member.data,
  }));
}
