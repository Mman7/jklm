export interface Room {
  createdAt: Date;
  hostId: string;
  id: string;
  scores?: Record<string, number>;
}
