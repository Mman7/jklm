import { createTokenRequest } from "@/src/app/api/ably-token/route";
import { EventRequestBody } from "@/src/app/api/events/route";
import { CreateRoomRequest } from "@/src/app/api/room/route";
import { ServerEvent } from "@/src/types/enum/server_events";
import { Question, QuestionHashOnly } from "@/src/types/question";
import { Room } from "@/src/types/room";
import { generateUID } from "@/src/utils/uuid";
import { TokenRequest } from "ably";
import ky from "ky";

export const hostRoom = async ({
  playerId,
}: {
  playerId: string;
}): Promise<Room> => {
  const req: CreateRoomRequest = { playerId: playerId };
  return ky.post("/api/room", { json: req }).json<Room>();
};

export const generateNameWithUUID = (name: string): string => {
  return `${name}-${generateUID()}`;
};

export const getUserToken = ({
  playerId,
}: createTokenRequest): Promise<TokenRequest> => {
  return ky.post("/api/ably-token", { json: playerId }).json<TokenRequest>();
};

export const getRoom = (roomId: string): Promise<Room> => {
  return ky.get(`/api/room/${roomId}`).json<Room>();
};

export const getAllRooms = (): Promise<Room[]> => {
  return ky.get("/api/room/all").json<Room[]>();
};

export const noticeServerNewQuestion = (roomId: string) => {
  const req: EventRequestBody = {
    type: ServerEvent.NewQuestion,
    roomId,
  };
  return ky.post("/api/events", { json: req });
};

export const getQuestion = (question: QuestionHashOnly): Promise<Question> => {
  return ky.get(`/api/question/${question.hash}`).json<Question>();
};

export const getAnswer = (questionHash: string): Promise<string> => {
  return ky.get(`/api/question/${questionHash}/answer`).json<string>();
};
