import { useCallback } from 'react'
import type {
  StartGameMessage,
  VoteMessage,
  KillMessage,
  HealMessage,
  DetectMessage,
  ShootMessage,
  RevengeMessage,
  SilentMessage,
  SubmitVotesMessage,
  SubmitVoteResultMessage,
} from '../events'

interface UseGameActionsOptions {
  send: (data: unknown) => void
}

export function useGameActions({ send }: UseGameActionsOptions) {
  const startGame = useCallback(
    (playerIds: number[]) => {
      const msg: StartGameMessage = { type: 'start_game', player_ids: playerIds }
      send(msg)
    },
    [send],
  )

  const castVote = useCallback(
    (targetId: number) => {
      const msg: VoteMessage = { type: 'vote', target_id: targetId }
      send(msg)
    },
    [send],
  )

  const killPlayer = useCallback(
    (targetId: number) => {
      const msg: KillMessage = { type: 'kill', target_id: targetId }
      send(msg)
    },
    [send],
  )

  const healPlayer = useCallback(
    (targetId: number) => {
      const msg: HealMessage = { type: 'heal', target_id: targetId }
      send(msg)
    },
    [send],
  )

  const detectPlayer = useCallback(
    (targetId: number) => {
      const msg: DetectMessage = { type: 'detect', target_id: targetId }
      send(msg)
    },
    [send],
  )

  const shootPlayer = useCallback(
    (targetId: number) => {
      const msg: ShootMessage = { type: 'shoot', target_id: targetId }
      send(msg)
    },
    [send],
  )

  const revengeKill = useCallback(
    (targetId: number) => {
      const msg: RevengeMessage = { type: 'revenge', target_id: targetId }
      send(msg)
    },
    [send],
  )

  const silentAction = useCallback(
    (targetId?: number) => {
      const msg: SilentMessage = { type: 'silent', target_id: targetId ?? null }
      send(msg)
    },
    [send],
  )

  const submitVotes = useCallback(() => {
    const msg: SubmitVotesMessage = { type: 'submit_votes' }
    send(msg)
  }, [send])

  const submitVoteResult = useCallback(() => {
    const msg: SubmitVoteResultMessage = { type: 'submit_vote_result' }
    send(msg)
  }, [send])

  return {
    startGame,
    castVote,
    killPlayer,
    healPlayer,
    detectPlayer,
    shootPlayer,
    revengeKill,
    silentAction,
    submitVotes,
    submitVoteResult,
  }
}
