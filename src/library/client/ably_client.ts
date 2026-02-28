import { Player } from "@/src/types/player";
import { SyncData, SyncMessage } from "@/src/types/sync_data";
import Ably from "ably";

// Singleton realtime client/channel references for the active room session.
let ably: Ably.Realtime | undefined;
let channel: Ably.RealtimeChannel | undefined;
// Track joined room ids to avoid duplicate join workflows.
const joinedChannels = new Set<string>();

export function initAbly({
  roomId,
  playerId,
}: {
  roomId: string;
  playerId: string;
}) {
  // Use token auth endpoint so API keys never reach the browser.
  ably = new Ably.Realtime({
    authUrl: "/api/ably-token",
    authMethod: "POST",
    authParams: {
      playerId: playerId,
    },
  });
  // Channel naming convention is shared across server + clients.
  channel = ably.channels.get(`room-${roomId}`);
  joinedChannels.add(roomId);
  return channel;
}

export function sendMessage(text: string, playerId: string) {
  if (!channel) return;
  // Publish chat payload to room chat stream.
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
  // Forward raw Ably message data to app-level chat handler.
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

  // Listen to gameplay events (new question, winner, etc.).
  const handler = (message: Ably.Message) => onMessage(message.data);
  channel.subscribe("events", handler);

  return () => {
    if (!channel) return;
    channel.unsubscribe("events", handler);
  };
}

export function hasJoined(channelName: string) {
  // Check local room-join bookkeeping.
  return joinedChannels.has(channelName);
}

export function enterChannel(playerProps: Player) {
  if (!channel) return;
  // Presence enter announces the player and initial stats.
  channel.presence.enter(playerProps);
}

export async function leaveRoom() {
  if (!channel) return;
  if (!ably) return;

  // Leave presence first so other clients immediately see departure.
  try {
    await channel.presence.leave();
  } catch {}

  // Detach channel and wait for completion before release.
  if (channel.state === "attached" || channel.state === "attaching") {
    await new Promise<void>((resolve) => {
      channel?.once("detached", () => resolve());
      channel?.detach();
    });
  }

  // Once detached, release local channel resources.
  ably.channels.release(channel.name);
}
// // update last chat to persence

export async function getAllPlayers() {
  if (!channel) return;
  // Read current presence members and normalize into app shape.
  const members = await channel.presence.get();
  return members.map((member) => ({
    clientId: member.clientId,
    ...member.data,
  }));
}

// update player stats to presence
export async function ablyUpdatePlayerStats(playerProps: Player) {
  if (!channel) return;
  // Presence update is used as lightweight shared player state.
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
  // Broadcast sync payload on dedicated sync stream.
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
  // Ask peers for their latest question/timer snapshot.
  channel.publish("sync", {
    type: "sync_request",
    requesterId,
  } satisfies SyncMessage);
}

// subscribe to sync data
export function subscribeToSync(onSync: (syncData: SyncMessage) => void) {
  if (!channel) return () => {};

  // Unified subscription for both sync_request and sync_data messages.
  const handler = (message: Ably.Message) => onSync(message.data);
  channel.subscribe("sync", handler);

  return () => {
    if (!channel) return;
    channel.unsubscribe("sync", handler);
  };
}
