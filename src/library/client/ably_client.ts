//TODO implement ably for chat interaction
import { Player } from "@/src/types/player";
import Ably from "ably";

let ably: Ably.Realtime | undefined;
let channel: Ably.RealtimeChannel | undefined;

export const initAbly = ({
  roomId,
  playerId,
}: {
  roomId: string;
  playerId: string;
}) => {
  ably = new Ably.Realtime({
    authUrl: "/api/ably-token",
    authMethod: "POST",
    authParams: {
      playerId: playerId,
    },
  });
  channel = ably.channels.get(`room-${roomId}`);
  return channel;
};

export function sendMessage(text: string) {
  if (!channel) return;

  channel.publish("chat", {
    text,
    timestamp: Date.now(),
  });
  updateLastChat(text);
}

export function subscribeToMessages(
  onMessage: (msg: { text: string; timestamp: number }) => void,
) {
  if (!channel) return;

  channel.subscribe("chat", (message) => {
    onMessage(message.data);
  });
}

export function enterChannel(playerProps: Player) {
  if (!channel) return;
  channel.presence.enter(playerProps);
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
