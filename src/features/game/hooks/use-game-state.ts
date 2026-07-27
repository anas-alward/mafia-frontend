import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '#/features/auth/store/auth-store'
import type { WsMessage } from '#/features/rooms/hooks/use-room-websocket'
import type {
  GamePhase,
  GameLogEntry,
  RequiredAction,
  GameStatePlayer,
  GameStartedEvent,
  RoleAssignedEvent,
  SunRiseEvent,
  SunSetEvent,
  VoteCastEvent,
  VoteResultStartedEvent,
  GameStateEvent,
  GameResetEvent,
} from '#/features/game/events'

export interface GameState {
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
  roundNumber: number | null
  mafiaIds: number[]
  requiredActions: RequiredAction[]
}

export function useGameState(lastMessage: WsMessage | null) {
  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser ? Number(currentUser.id) : null

  const [phase, setPhase] = useState<GamePhase>('lobby')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [playerIds, setPlayerIds] = useState<number[]>([])
  const [alivePlayerIds, setAlivePlayerIds] = useState<number[]>([])
  const [deadPlayerIds, setDeadPlayerIds] = useState<number[]>([])
  const [players, setPlayers] = useState<GameStatePlayer[]>([])
  const [myRole, setMyRole] = useState<string | null>(null)
  const [myRoleCode, setMyRoleCode] = useState<string | null>(null)
  const [myRoleDescription, setMyRoleDescription] = useState<string | null>(null)
  const [myRoleType, setMyRoleType] = useState<string | null>(null)
  const [logs, setLogs] = useState<GameLogEntry[]>([])
  const [currentVotes, setCurrentVotes] = useState<Map<number, number>>(new Map())
  const [lynchTargetId, setLynchTargetId] = useState<number | null>(null)
  const [mafiaIds, setMafiaIds] = useState<number[]>([])
  const [mafiaMemberRoles, setMafiaMemberRoles] = useState<Record<number, string>>({})
  const [roundNumber, setRoundNumber] = useState<number | null>(null)
  const [requiredActions, setRequiredActions] = useState<RequiredAction[]>([])
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
        setDeadPlayerIds([])
        setPhase('day')
        setCurrentVotes(new Map())
        setLogs([])
        setLynchTargetId(null)
        setMafiaIds([])
        setMafiaMemberRoles({})
        setRequiredActions(msg.required_actions)
        break
      }

      case 'role_assigned': {
        const msg = lastMessage as RoleAssignedEvent
        setMyRole(msg.role_name)
        setMyRoleCode(msg.role_code)
        setMyRoleDescription(msg.description)
        setMyRoleType(msg.role_type)
        if (msg.mafia_ids && msg.mafia_ids.length > 0) {
          setMafiaIds(msg.mafia_ids)
        }
        if (msg.mafia_members && msg.mafia_members.length > 0) {
          const map: Record<number, string> = {}
          for (const m of msg.mafia_members) {
            map[m.id] = m.role_code
          }
          setMafiaMemberRoles(map)
        }
        break
      }

      case 'sun_rise': {
        const msg = lastMessage as SunRiseEvent
        setAlivePlayerIds(msg.player_ids)
        setDeadPlayerIds(
          playerIds.filter((id) => !msg.player_ids.includes(id))
        )
        setPhase('day')
        setCurrentVotes(new Map())
        setLynchTargetId(null)
        setLogs((prev) => [...prev, ...msg.logs])
        setRequiredActions(msg.required_actions)
        break
      }

      case 'sun_set': {
        const msg = lastMessage as SunSetEvent
        setAlivePlayerIds(msg.player_ids)
        setDeadPlayerIds(
          playerIds.filter((id) => !msg.player_ids.includes(id))
        )
        setPhase('night')
        setCurrentVotes(new Map())
        setLynchTargetId(null)
        setLogs((prev) => [...prev, ...msg.logs])
        setRequiredActions(msg.required_actions)
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
        setRequiredActions(msg.required_actions)
        break
      }

      case 'game_state': {
        const msg = lastMessage as GameStateEvent
        if (msg.session_id && msg.current_phase) {
          setSessionId(msg.session_id)
          setPhase(msg.current_phase as GamePhase)
          setRoundNumber(msg.round_number)
          setPlayers(msg.players)
          setPlayerIds(msg.players.map((p) => p.id))
          setAlivePlayerIds(msg.live_player_ids)
          setDeadPlayerIds(msg.dead_player_ids)
          setLogs(msg.logs)
          setLynchTargetId(msg.lynch_target_id)
          setRequiredActions(msg.required_actions)

          // Use backend-provided role info directly.
          if (msg.role_code) {
            setMyRole(msg.role_name)
            setMyRoleCode(msg.role_code)
            setMyRoleDescription(msg.role_description)
            setMyRoleType(msg.role_type)
          }
          if (msg.mafia_ids) {
            setMafiaIds(msg.mafia_ids)
          }

          setCurrentVotes(new Map())
        }
        break
      }

      case 'game_reset': {
        const msg = lastMessage as GameResetEvent
        setSessionId(msg.session_id)
        setPlayerIds(msg.player_ids)
        setAlivePlayerIds(msg.alive_ids)
        setDeadPlayerIds([])
        setPhase('day')
        setCurrentVotes(new Map())
        setLogs([])
        setLynchTargetId(null)
        setMafiaIds([])
        setMafiaMemberRoles({})
        setRequiredActions(msg.required_actions)
        break
      }

      case 'game_canceled': {
        resetGame()
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
    setDeadPlayerIds([])
    setPlayers([])
    setMyRole(null)
    setMyRoleCode(null)
    setMyRoleDescription(null)
    setMyRoleType(null)
    setLogs([])
    setCurrentVotes(new Map())
    setLynchTargetId(null)
    setMafiaIds([])
    setMafiaMemberRoles({})
    setRoundNumber(null)
    setRequiredActions([])
  }, [])

  return {
    phase,
    sessionId,
    gameStarted,
    playerIds,
    alivePlayerIds,
    deadPlayerIds,
    players,
    myRole,
    myRoleCode,
    myRoleDescription,
    myRoleType,
    logs,
    currentVotes,
    lynchTargetId,
    hasVotedThisPhase,
    mafiaIds,
    mafiaMemberRoles,
    roundNumber,
    requiredActions,
    resetGame,
  }
}
