import { createTokenRequest } from "@/src/app/api/ably-token/route";
import { CreateRoomRequest } from "@/src/app/api/create-room/route";
import { Room } from "@/src/app/types/room";
import { generateUID } from "@/src/utils/uuid";
import { TokenRequest } from "ably";

export const hostRoom = async (request: CreateRoomRequest): Promise<Room> => {
  return new Promise((resolve, reject) => {
    // try to create room
    fetch(`/api/create-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }).then((res) => {
      res.json().then((data: Room) => {
        if (res.status === 201) resolve(data);
        else reject(new Error("Failed to create room"));
      });
    });
  });
};

export const generateNameWithUUID = (name: string): string => {
  return `${name}-${generateUID()}`;
};

export const getUserToken = ({
  uuid,
}: createTokenRequest): Promise<TokenRequest> => {
  return new Promise((resolve, reject) => {
    fetch("/api/ably-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uuid),
    }).then((res) => {
      if (res.status === 200) {
        res.json().then((data: TokenRequest) => {
          resolve(data);
        });
      } else {
        reject(new Error("Failed to get user token"));
      }
    });
  });
};

export const getRoom = (roomId: string): Promise<Room> => {
  return new Promise((resolve, reject) => {
    fetch(`/api/get-room/${roomId}`)
      .then((res) => {
        if (res.status !== 200) reject(new Error("Room not found"));
        if (res.status === 200) res.json().then((data: Room) => resolve(data));
      })
      // network error
      .catch((err) => reject(err));
  });
};
