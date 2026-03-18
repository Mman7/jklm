export function getLeaderPlayerId(playerIds: string[]) {
  if (playerIds.length === 0) return null;

  return [...playerIds].sort((a, b) => a.localeCompare(b))[0] ?? null;
}

export function isLeaderPlayerId(playerId: string, playerIds: string[]) {
  if (!playerId) return false;
  return getLeaderPlayerId(playerIds) === playerId;
}
