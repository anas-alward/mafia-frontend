import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WsMessage } from '#/features/rooms/hooks/use-room-websocket'
import type {
  ActionSignalEvent,
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
  GameOverEvent,
  DetectResultEvent,
  StartGameMessage,
  VoteMessage,
  KillMessage,
  HealMessage,
  DetectMessage,
  ShootMessage,
  RevengeMessage,
  SilenceMessage,
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
  /** Transient per-recipient tile signals (audience decided server-side). */
  actionSignals: (ActionSignalEvent & { seq: number })[]
  actionSignalVersion: number
  /**
   * Persistent tile borders keyed by target id → action type. Set by
   * action signals, cleared on phase transitions. Vote borders are derived
   * from currentVotes instead.
   */
  actionBorders: Partial<Record<number, string>>
  /** Clicking a vote badge selects the voters of that target. */
  voterSelection: { targetId: number | null; voterIds: number[] }
  /** Anonymous per-action-type status for the current phase (no names). */
  roundRequirements: { action_type: string; done: boolean }[]
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
  silencePlayer: (targetId: number) => void
  submitVotes: () => void
  submitVoteResult: () => void
  resetGame: () => void
  cancelGame: () => void
  clearDetectResult: () => void
  setVoterSelection: (targetId: number, voterIds: number[]) => void
  clearVoterSelection: () => void
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
          actionSignals: [],
          actionSignalVersion: 0,
          actionBorders: {},
          voterSelection: { targetId: null, voterIds: [] },
          roundRequirements: [],
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
              players: m.players,
              phase: 'day',
              gameStarted: true,
              currentVotes: new Map(),
              logs: [],
              lynchTargetId: null,
              hasVotedThisPhase: false,
              mafiaIds: [],
              mafiaMemberRoles: {},
              requiredActions: m.required_actions,
              roundRequirements: m.round_requirements ?? [],
              actionBorders: {},
              voterSelection: { targetId: null, voterIds: [] },
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
              roundRequirements: m.round_requirements ?? [],
              actionBorders: {},
              voterSelection: { targetId: null, voterIds: [] },
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
              roundRequirements: m.round_requirements ?? [],
              actionBorders: {},
              voterSelection: { targetId: null, voterIds: [] },
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
              roundRequirements: m.round_requirements ?? [],
            }))
            break
          }

          case 'game_state': {
            const m = msg as GameStateEvent
            if (m.session_id && m.current_phase) {
              // Rebuild the current round's votes from its logs so the vote
              // badges survive a mid-day reconnect.
              const votesFromLogs = new Map<number, number>()
              for (const log of m.logs) {
                if (
                  log.action_type === 'vote' &&
                  log.actor_id != null &&
                  log.target_id != null
                ) {
                  votesFromLogs.set(log.actor_id, log.target_id)
                }
              }
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
                roundRequirements: m.round_requirements ?? [],
                currentVotes: votesFromLogs,
                actionBorders: {},
                voterSelection: { targetId: null, voterIds: [] },
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
              players: m.players,
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
              roundRequirements: m.round_requirements ?? [],
              actionBorders: {},
              voterSelection: { targetId: null, voterIds: [] },
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
              actionBorders: {},
              voterSelection: { targetId: null, voterIds: [] },
              roundRequirements: [],
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

          case 'action_signal': {
            const m = msg as ActionSignalEvent
            const s = get()
            set({
              actionSignals: [
                ...s.actionSignals.slice(-49),
                { ...m, seq: s.actionSignalVersion + 1 },
              ],
              actionSignalVersion: s.actionSignalVersion + 1,
              // Persist a colored border on the target tile until the next
              // phase transition. Vote borders derive from currentVotes.
              actionBorders:
                m.action_type === 'vote'
                  ? s.actionBorders
                  : { ...s.actionBorders, [m.target_id]: m.action_type },
            })
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
        actionSignals: [],
        actionSignalVersion: 0,
        actionBorders: {},
        voterSelection: { targetId: null, voterIds: [] },
        roundRequirements: [],
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
        silencePlayer: (targetId) => {
          const msg: SilenceMessage = {
            type: 'silence',
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
          const { phase, playerIds } = get()
          // The backend flushes the session on game over, so `reset` would
          // fail with GAME_NOT_STARTED. Restart via start_game with the same players.
          if (phase === 'ended') {
            const msg: StartGameMessage = {
              type: 'start_game',
              player_ids: playerIds,
            }
            send_(msg)
            return
          }
          const msg: ResetGameMessage = { type: 'reset' }
          send_(msg)
        },
        cancelGame: () => {
          const msg: CancelGameMessage = { type: 'cancel' }
          send_(msg)
        },
        clearDetectResult: () => set({ detectResult: null }),
        setVoterSelection: (targetId, voterIds) =>
          set({ voterSelection: { targetId, voterIds } }),
        clearVoterSelection: () =>
          set({ voterSelection: { targetId: null, voterIds: [] } }),
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
          silencePlayer,
          submitVotes,
          submitVoteResult,
          resetGame,
          cancelGame,
          // transient overlays — never replay after a refresh
          actionSignals,
          actionSignalVersion,
          actionBorders,
          voterSelection,
          roundRequirements,
          detectResult,
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
