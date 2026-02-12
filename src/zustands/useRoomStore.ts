import { create } from "zustand";
import Ably from "ably";
import { Player } from "../types/player";
import { Status } from "../types/enum/player_status";

interface RoomStore {
  roomId: string;
  setRoomId: (roomId: string) => void;
  player: Player;
  updatePlayerStats: (playerParam: Player) => void;
  channel: Ably.RealtimeChannel | null;
  setChannel: (channel: Ably.RealtimeChannel) => void;
}

const useRoomStore = create<RoomStore>((set) => ({
  roomId: "",
  setRoomId: (roomIdValue: string) => set(() => ({ roomId: roomIdValue })),
  player: {
    name: "",
    playerId: "",
    score: 0,
    status: Status.waiting,
    lastChat: "",
  },
  updatePlayerStats: (playerParam: Player) =>
    set(() => ({ player: playerParam })),
  channel: null,
  setChannel: (channelValue) => set(() => ({ channel: channelValue })),
}));

export default function useRoom() {
  const { roomId, setRoomId, channel, setChannel, player, updatePlayerStats } =
    useRoomStore();
  return { roomId, setRoomId, channel, setChannel, player, updatePlayerStats };
}
