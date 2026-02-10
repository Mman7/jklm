import { Room } from "@/src/app/types/room";

// TODO add playerToken
export const hostRoom: (playerToken?: string) => Promise<Room> = async () => {
  return new Promise((resolve, reject) => {
    // try to create room
    fetch(`/api/create-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify(),
    }).then((res) => {
      res.json().then((data: Room) => {
        if (res.status === 201) resolve(data);
        else reject(new Error("Failed to create room"));
      });
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
