import { createContext, useContext } from 'react'
import type { GamePhase, GameLogEntry } from '../events'

export interface GameContextValue {
  phase: GamePhase
  sessionId: string | null
  gameStarted: boolean
  playerIds: number[]
  alivePlayerIds: number[]
  myRole: string | null
  myRoleDescription: string | null
  myRoleType: string | null
  logs: GameLogEntry[]
  currentVotes: Map<number, number>
  lynchTargetId: number | null
  hasVotedThisPhase: boolean
  mafiaIds: Set<number>
  resetGame: () => void
  startGame: (playerIds: number[]) => void
  castVote: (targetId: number) => void
  killPlayer: (targetId: number) => void
  healPlayer: (targetId: number) => void
  detectPlayer: (targetId: number) => void
  shootPlayer: (targetId: number) => void
  revengeKill: (targetId: number) => void
  silentAction: (targetId?: number) => void
  submitVotes: () => void
  submitVoteResult: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameContextProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: GameContextValue
}) {
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGameContext() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameContext must be used within GameContextProvider')
  return ctx
}
