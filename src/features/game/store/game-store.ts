import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GamePhase, GameLogEntry, RequiredAction, GameStatePlayer } from '#/features/game/events'

interface GameStore {
  phase: GamePhase
  sessionId: string | null
  gameStarted: boolean
  playerIds: number[]
  alivePlayerIds: number[]
  deadPlayerIds: number[]
  players: GameStatePlayer[]
  myRoleCode: string | null
  logs: GameLogEntry[]
  currentVotes: Map<number, number>
  lynchTargetId: number | null
  hasVotedThisPhase: boolean
  mafiaIds: number[]
  mafiaMemberRoles: Record<number, string>
  roundNumber: number | null
  requiredActions: RequiredAction[]
  resetGame: () => void
  cancelGame: () => void
  startGame: (playerIds: number[]) => void
  castVote: (targetId: number) => void
  killPlayer: (targetId: number) => void
  healPlayer: (targetId: number) => void
  detectPlayer: (targetId: number) => void
  shootPlayer: (targetId: number) => void
  revengeKill: (targetId: number) => void
  silentAction: (targetId?: number) => void
  roleblockPlayer: (targetId: number) => void
  submitVotes: () => void
  submitVoteResult: () => void
}

const STORE_NAME = 'mafia-game'

export const useGameStore = create<GameStore>()(
  persist(
    (): GameStore => ({
      phase: 'lobby',
      sessionId: null,
      gameStarted: false,
      playerIds: [],
      alivePlayerIds: [],
      deadPlayerIds: [],
      players: [],
      myRoleCode: null,
      logs: [],
      currentVotes: new Map(),
      lynchTargetId: null,
      hasVotedThisPhase: false,
      mafiaIds: [],
      mafiaMemberRoles: {},
      roundNumber: null,
      requiredActions: [],
      resetGame: () => {},
      cancelGame: () => {},
      startGame: () => {},
      castVote: () => {},
      killPlayer: () => {},
      healPlayer: () => {},
      detectPlayer: () => {},
      shootPlayer: () => {},
      revengeKill: () => {},
      silentAction: () => {},
      roleblockPlayer: () => {},
      submitVotes: () => {},
      submitVoteResult: () => {},
    }),
    {
      name: STORE_NAME,
      partialize: (state) => {
        const {
          resetGame,
          cancelGame,
          startGame,
          castVote,
          killPlayer,
          healPlayer,
          detectPlayer,
          shootPlayer,
          revengeKill,
          silentAction,
          roleblockPlayer,
          submitVotes,
          submitVoteResult,
          ...data
        } = state
        return {
          ...data,
          currentVotes: Array.from(data.currentVotes.entries()),
        }
      },
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown>
        return {
          ...current,
          ...p,
          currentVotes: new Map(p.currentVotes as Iterable<[number, number]> | undefined ?? []),
        }
      },
    },
  ),
)
