import { request } from '#/lib/api-client'

/** Players whose CURRENT vote targets the given player. */
export async function getVoters(
  sessionId: string,
  playerId: number,
): Promise<number[]> {
  const data = await request<{ voter_ids: number[] }>(
    `/game-session/${sessionId}/players/${playerId}/voters/`,
  )
  return data.voter_ids
}
