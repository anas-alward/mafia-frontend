import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '#/features/auth/store/auth-store'
import type { WsMessage } from './use-room-websocket'
import type {
  GamePhase,
  GameLogEntry,
  GameStartedEvent,
  RoleAssignedEvent,
  SunRiseEvent,
  SunSetEvent,
  VoteCastEvent,
  VoteResultStartedEvent,
} from '../events'

export interface GameState {
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
}

export function useGameState(lastMessage: WsMessage | null) {
  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser ? Number(currentUser.id) : null

  const [phase, setPhase] = useState<GamePhase>('lobby')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [playerIds, setPlayerIds] = useState<number[]>([])
  const [alivePlayerIds, setAlivePlayerIds] = useState<number[]>([])
  const [myRole, setMyRole] = useState<string | null>(null)
  const [myRoleDescription, setMyRoleDescription] = useState<string | null>(null)
  const [myRoleType, setMyRoleType] = useState<string | null>(null)
  const [logs, setLogs] = useState<GameLogEntry[]>([])
  const [currentVotes, setCurrentVotes] = useState<Map<number, number>>(new Map())
  const [lynchTargetId, setLynchTargetId] = useState<number | null>(null)
  const [mafiaIds, setMafiaIds] = useState<Set<number>>(new Set())
  const prevPhaseRef = useRef<GamePhase>('lobby')

  const gameStarted = phase !== 'lobby' && phase !== 'ended'

  useEffect(() => {
    if (!lastMessage) return

    switch (lastMessage.type) {
      case 'game_started': {
        const msg = lastMessage as GameStartedEvent
        setSessionId(msg.session_id)
        setPlayerIds(msg.player_ids)
        setAlivePlayerIds(msg.alive_ids)
        setPhase('day')
        setCurrentVotes(new Map())
        setLogs([])
        setLynchTargetId(null)
        break
      }

      case 'role_assigned': {
        const msg = lastMessage as RoleAssignedEvent
        setMyRole(msg.role_name)
        setMyRoleDescription(msg.description)
        setMyRoleType(msg.role_type)
        if (msg.mafia_ids && msg.mafia_ids.length > 0) {
          setMafiaIds(new Set(msg.mafia_ids))
        }
        break
      }

      case 'sun_rise': {
        const msg = lastMessage as SunRiseEvent
        setAlivePlayerIds(msg.player_ids)
        setPhase('day')
        setCurrentVotes(new Map())
        setLynchTargetId(null)
        setLogs((prev) => [...prev, ...msg.logs])
        break
      }

      case 'sun_set': {
        const msg = lastMessage as SunSetEvent
        setAlivePlayerIds(msg.player_ids)
        setPhase('night')
        setCurrentVotes(new Map())
        setLynchTargetId(null)
        setLogs((prev) => [...prev, ...msg.logs])
        break
      }

      case 'vote_cast': {
        const msg = lastMessage as VoteCastEvent
        setCurrentVotes((prev) => {
          const next = new Map(prev)
          next.set(msg.actor_id, msg.target_id)
          return next
        })
        break
      }

      case 'vote_result_started': {
        const msg = lastMessage as VoteResultStartedEvent
        setPhase('vote_result')
        setLynchTargetId(msg.lynch_target_id)
        setLogs((prev) => [...prev, ...msg.logs])
        break
      }
    }
  }, [lastMessage])

  // Track phase changes for vote reset
  useEffect(() => {
    prevPhaseRef.current = phase
  }, [phase])

  const hasVotedThisPhase =
    phase === 'day' && currentUserId !== null && currentVotes.has(currentUserId)

  const resetGame = useCallback(() => {
    setPhase('lobby')
    setSessionId(null)
    setPlayerIds([])
    setAlivePlayerIds([])
    setMyRole(null)
    setMyRoleDescription(null)
    setMyRoleType(null)
    setLogs([])
    setCurrentVotes(new Map())
    setLynchTargetId(null)
    setMafiaIds(new Set())
  }, [])

  return {
    phase,
    sessionId,
    gameStarted,
    playerIds,
    alivePlayerIds,
    myRole,
    myRoleDescription,
    myRoleType,
    logs,
    currentVotes,
    lynchTargetId,
    hasVotedThisPhase,
    mafiaIds,
    resetGame,
  }
}
