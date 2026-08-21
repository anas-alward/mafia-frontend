import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WsMessage } from '#/features/rooms/hooks/use-room-websocket'
import type {
  GamePhase,
  Winner,
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
  GameCanceledEvent,
  GameOverEvent,
  DetectResultEvent,
  StartGameMessage,
  VoteMessage,
  KillMessage,
  HealMessage,
  DetectMessage,
  ShootMessage,
  RevengeMessage,
  SilentMessage,
  RoleblockMessage,
  SubmitVotesMessage,
  SubmitVoteResultMessage,
  ResetGameMessage,
  CancelGameMessage,
} from '#/features/game/events'

interface GameStore {
  // State
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
  detectResult: { targetId: number; roleType: string } | null
  winner: Winner | null
  _send: ((data: unknown) => void) | null

  // Internal helper
  _resetToLobby: () => void

  // Send injector
  setSend: (send: (data: unknown) => void) => void

  // Message processor
  processMessage: (msg: WsMessage) => void

  // Outbound actions
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
  resetGame: () => void
  cancelGame: () => void
  clearDetectResult: () => void
}

const STORE_NAME = 'mafia-game'

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      const _resetToLobby = () => {
        set({
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
          detectResult: null,
          winner: null,
        })
      }

      const processMessage = (msg: WsMessage) => {
        switch (msg.type) {
          case 'game_started': {
            const m = msg as GameStartedEvent
            set({
              sessionId: m.session_id,
              playerIds: m.player_ids,
              alivePlayerIds: m.alive_ids,
              deadPlayerIds: [],
              phase: 'day',
              gameStarted: true,
              currentVotes: new Map(),
              logs: [],
              lynchTargetId: null,
              hasVotedThisPhase: false,
              mafiaIds: [],
              mafiaMemberRoles: {},
              requiredActions: m.required_actions,
              winner: null,
            })
            break
          }

          case 'role_assigned': {
            const m = msg as RoleAssignedEvent
            const updates: Partial<GameStore> = { myRoleCode: m.role_code }
            if (m.mafia_ids && m.mafia_ids.length > 0) {
              updates.mafiaIds = m.mafia_ids
            }
            if (m.mafia_members && m.mafia_members.length > 0) {
              const map: Record<number, string> = {}
              for (const member of m.mafia_members) {
                map[member.id] = member.role_code
              }
              updates.mafiaMemberRoles = map
            }
            set(updates)
            break
          }

          case 'sun_rise': {
            const m = msg as SunRiseEvent
            const { playerIds } = get()
            set((s) => ({
              alivePlayerIds: m.player_ids,
              deadPlayerIds: playerIds.filter(
                (id) => !m.player_ids.includes(id),
              ),
              phase: 'day',
              currentVotes: new Map(),
              lynchTargetId: null,
              hasVotedThisPhase: false,
              logs: [...s.logs, ...m.logs],
              requiredActions: m.required_actions,
            }))
            break
          }

          case 'sun_set': {
            const m = msg as SunSetEvent
            const { playerIds } = get()
            set((s) => ({
              alivePlayerIds: m.player_ids,
              deadPlayerIds: playerIds.filter(
                (id) => !m.player_ids.includes(id),
              ),
              phase: 'night',
              currentVotes: new Map(),
              lynchTargetId: null,
              hasVotedThisPhase: false,
              logs: [...s.logs, ...m.logs],
              requiredActions: m.required_actions,
            }))
            break
          }

          case 'vote_cast': {
            const m = msg as VoteCastEvent
            set((s) => {
              const next = new Map(s.currentVotes)
              next.set(m.actor_id, m.target_id)
              return { currentVotes: next }
            })
            break
          }

          case 'vote_result_started': {
            const m = msg as VoteResultStartedEvent
            set((s) => ({
              phase: 'vote_result',
              lynchTargetId: m.lynch_target_id,
              logs: [...s.logs, ...m.logs],
              requiredActions: m.required_actions,
            }))
            break
          }

          case 'game_state': {
            const m = msg as GameStateEvent
            if (m.session_id && m.current_phase) {
              const updates: Partial<GameStore> = {
                sessionId: m.session_id,
                phase: m.current_phase as GamePhase,
                gameStarted:
                  m.current_phase !== 'lobby' && m.current_phase !== 'ended',
                roundNumber: m.round_number,
                players: m.players,
                playerIds: m.players.map((p) => p.id),
                alivePlayerIds: m.live_player_ids,
                deadPlayerIds: m.dead_player_ids,
                logs: m.logs,
                lynchTargetId: m.lynch_target_id,
                requiredActions: m.required_actions,
                currentVotes: new Map(),
              }
              if (m.role_code) {
                updates.myRoleCode = m.role_code
              }
              if (m.mafia_ids) {
                updates.mafiaIds = m.mafia_ids
              }
              set(updates)
            } else {
              _resetToLobby()
            }
            break
          }

          case 'game_reset': {
            const m = msg as GameResetEvent
            set({
              sessionId: m.session_id,
              playerIds: m.player_ids,
              alivePlayerIds: m.alive_ids,
              deadPlayerIds: [],
              players: [],
              phase: 'day',
              gameStarted: true,
              myRoleCode: null,
              currentVotes: new Map(),
              logs: [],
              lynchTargetId: null,
              hasVotedThisPhase: false,
              mafiaIds: [],
              mafiaMemberRoles: {},
              roundNumber: null,
              requiredActions: m.required_actions,
              winner: null,
            })
            break
          }

          case 'game_over': {
            const m = msg as GameOverEvent
            set((s) => ({
              phase: 'ended',
              winner: m.winner,
              logs: [...s.logs, ...m.logs],
              currentVotes: new Map(),
              lynchTargetId: null,
              hasVotedThisPhase: false,
              requiredActions: [],
            }))
            break
          }

          case 'game_canceled': {
            _resetToLobby()
            break
          }

          case 'detect_result': {
            const m = msg as DetectResultEvent
            set({ detectResult: { targetId: m.target_id, roleType: m.role_type } })
            break
          }
        }
      }

      const send_ = (data: unknown) => {
        const fn = get()._send
        console.log('[GameStore] send_ called', { data, hasSend: fn != null })
        fn?.(data)
      }

      return {
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
        detectResult: null,
        winner: null,
        _send: null,

        _resetToLobby,

        setSend: (send) => set({ _send: send }),

        processMessage,

        startGame: (playerIds) => {
          const msg: StartGameMessage = {
            type: 'start_game',
            player_ids: playerIds,
          }
          send_(msg)
        },
        castVote: (targetId) => {
          const msg: VoteMessage = { type: 'vote', target_id: targetId }
          send_(msg)
        },
        killPlayer: (targetId) => {
          const msg: KillMessage = { type: 'kill', target_id: targetId }
          send_(msg)
        },
        healPlayer: (targetId) => {
          const msg: HealMessage = { type: 'heal', target_id: targetId }
          send_(msg)
        },
        detectPlayer: (targetId) => {
          const msg: DetectMessage = { type: 'detect', target_id: targetId }
          send_(msg)
        },
        shootPlayer: (targetId) => {
          const msg: ShootMessage = { type: 'shoot', target_id: targetId }
          send_(msg)
        },
        revengeKill: (targetId) => {
          const msg: RevengeMessage = { type: 'revenge', target_id: targetId }
          send_(msg)
        },
        silentAction: (targetId) => {
          const msg: SilentMessage = {
            type: 'silent',
            target_id: targetId ?? null,
          }
          send_(msg)
        },
        roleblockPlayer: (targetId) => {
          const msg: RoleblockMessage = {
            type: 'roleblock',
            target_id: targetId,
          }
          send_(msg)
        },
        submitVotes: () => {
          const msg: SubmitVotesMessage = { type: 'submit_votes' }
          send_(msg)
        },
        submitVoteResult: () => {
          const msg: SubmitVoteResultMessage = { type: 'submit_vote_result' }
          send_(msg)
        },
        resetGame: () => {
          const msg: ResetGameMessage = { type: 'reset' }
          send_(msg)
        },
        cancelGame: () => {
          const msg: CancelGameMessage = { type: 'cancel' }
          send_(msg)
        },
        clearDetectResult: () => set({ detectResult: null }),
      }
    },
    {
      name: STORE_NAME,
      partialize: (state) => {
        const {
          _send,
          _resetToLobby,
          setSend,
          processMessage,
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
          resetGame,
          cancelGame,
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
          currentVotes: new Map(
            (p.currentVotes as Iterable<[number, number]> | undefined) ?? [],
          ),
        }
      },
    },
  ),
)
