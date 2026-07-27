import { create } from 'zustand'
import type { GamePhase, GameLogEntry, RequiredAction, GameStatePlayer } from '#/features/game/events'

interface GameStore {
  phase: GamePhase
  sessionId: string | null
  gameStarted: boolean
  playerIds: number[]
  alivePlayerIds: number[]
  deadPlayerIds: number[]
  players: GameStatePlayer[]
  myRole: string | null
  myRoleCode: string | null
  myRoleDescription: string | null
  myRoleType: string | null
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

export const useGameStore = create<GameStore>(() => ({
  phase: 'lobby',
  sessionId: null,
  gameStarted: false,
  playerIds: [],
  alivePlayerIds: [],
  deadPlayerIds: [],
  players: [],
  myRole: null,
  myRoleCode: null,
  myRoleDescription: null,
  myRoleType: null,
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
}))
