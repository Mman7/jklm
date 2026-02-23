import { create } from "zustand";
import Ably from "ably";
import { Player } from "../types/player";
import { Room } from "../types/room";

interface RoomStore {
  room: Room | null;
  setRoom: (roomStat: Room) => void;
  player: Player | null;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  updatePlayerStats: (playerParam: Player) => void;
  lastChat: lastMessage;
  setLastChat: (lastChat: lastMessage) => void;
  channel: Ably.RealtimeChannel | null;
  setChannel: (channel: Ably.RealtimeChannel | null) => void;
}

const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  setRoom: (roomStat: Room) => set(() => ({ room: roomStat })),
  player: null,
  players: [],
  setPlayers: (players: Player[]) => set(() => ({ players })),
  lastChat: { message: "", senderId: "" },
  setLastChat: (lastChat: lastMessage) => set(() => ({ lastChat: lastChat })),
  updatePlayerStats: (playerParam: Player) =>
    set(() => ({ player: playerParam })),
  channel: null,
  setChannel: (channelValue) => set(() => ({ channel: channelValue })),
}));

export default function useRoom() {
  const {
    room,
    setRoom,
    channel,
    setChannel,
    player,
    updatePlayerStats,
    players,
    setPlayers,
    lastChat,
    setLastChat,
  } = useRoomStore();
  return {
    room,
    setRoom,
    channel,
    setChannel,
    player,
    updatePlayerStats,
    players,
    setPlayers,
    lastChat,
    setLastChat,
  };
}
