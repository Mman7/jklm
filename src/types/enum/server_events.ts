//TODO subscript to events
//  channel.publish("events", {
//     text,
//     playerId,
//     timestamp: Date.now(),
//   });

export enum ServerEvent {
  PlayerAnsweredCorrectly = "player_answered_correctly",
  GameStarted = "game_started",
}
