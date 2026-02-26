import { Player } from "@/src/types/player";
import { SyncData, SyncMessage } from "@/src/types/sync_data";
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
  channel.publish("chats", {
    text,
    playerId,
    timestamp: Date.now(),
  });
}

export function subscribeToMessages(
  onMessage: (msg: {
    text: string;
    timestamp: number;
    playerId: string;
  }) => void,
) {
  if (!channel) return;
  const handler = (message: Ably.Message) => onMessage(message.data);
  channel.subscribe("chats", handler);
  return () => {
    if (!channel) return;
    channel.unsubscribe("chats", handler);
  };
}

export function subscribeToEvents(
  onMessage: (msg: {
    text: string;
    timestamp: number;
    playerId: string;
  }) => void,
) {
  if (!channel) return () => {};

  const handler = (message: Ably.Message) => onMessage(message.data);
  channel.subscribe("events", handler);

  return () => {
    if (!channel) return;
    channel.unsubscribe("events", handler);
  };
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
// // update last chat to persence

export async function getAllPlayers() {
  if (!channel) return;
  const members = await channel.presence.get();
  return members.map((member) => ({
    clientId: member.clientId,
    ...member.data,
  }));
}

// update player stats to presence
export async function ablyUpdatePlayerStats(playerProps: Player) {
  if (!channel) return;
  await channel.presence.update({
    name: playerProps.name,
    playerId: playerProps.playerId,
    score: playerProps.score,
    lastChat: playerProps.lastChat,
    playerStatus: playerProps.playerStatus,
    fetchedStatus: playerProps.fetchedStatus,
  });
}

// SYNC DATA

// send current question and timer to all players
export function sendSyncData({
  requesterId,
  senderId,
  syncData,
}: {
  requesterId: string;
  senderId: string;
  syncData: SyncData;
}) {
  if (!channel) return;
  channel.publish("sync", {
    type: "sync_data",
    requesterId,
    senderId,
    payload: syncData,
  } satisfies SyncMessage);
}

// send sync request to all players to fetch current question and timer
export function sendSyncRequest(requesterId: string) {
  if (!channel) return;
  channel.publish("sync", {
    type: "sync_request",
    requesterId,
  } satisfies SyncMessage);
}

// subscribe to sync data
export function subscribeToSync(onSync: (syncData: SyncMessage) => void) {
  if (!channel) return () => {};

  const handler = (message: Ably.Message) => onSync(message.data);
  channel.subscribe("sync", handler);

  return () => {
    if (!channel) return;
    channel.unsubscribe("sync", handler);
  };
}
