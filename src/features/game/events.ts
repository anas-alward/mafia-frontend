// ── Game types ──

export type GamePhase = 'lobby' | 'day' | 'night' | 'vote_result' | 'ended'

export type Winner = 'mafia' | 'town'

export interface GameLogEntry {
  /** Present only when the audience may know who acted (votes, revenge).
   *  Omitted for anonymous events (kill, heal, silence). */
  actor_id?: number | null
  /** Absent on lynch entries (the victim rides in actor_id). */
  target_id?: number | null
  action_type: string
  /** Set on lynch entries — the eliminated player's revealed role. */
  role_code?: string | null
  role_name?: string | null
  /** Set on kill entries that were healed the same night. */
  result?: string
}

export interface ActionSignalEvent {
  type: 'action_signal'
  action_type: string
  target_id: number
  /** Present only for actions whose audience may know who acted (votes). */
  actor_id: number | null
}

export interface RequiredAction {
  action_type: string
  target_options: number[]
}

// ── Game Outbound (server → client) ──

export interface GameStartedEvent {
  type: 'game_started'
  player_ids: number[]
  session_id: string
  host: number
  alive_ids: number[]
  players: GameStatePlayer[]
  required_actions: RequiredAction[]
  round_requirements?: { action_type: string; done: boolean }[]
}

export interface RoleAssignedEvent {
  type: 'role_assigned'
  role_code: string
  role_name: string
  description: string
  role_type: string
  mafia_ids?: number[]
  mafia_members?: { id: number; role_code: string; role_name: string }[]
}

export interface SunRiseEvent {
  type: 'sun_rise'
  player_ids: number[]
  logs: GameLogEntry[]
  required_actions: RequiredAction[]
  round_requirements?: { action_type: string; done: boolean }[]
}

export interface SunSetEvent {
  type: 'sun_set'
  player_ids: number[]
  logs: GameLogEntry[]
  required_actions: RequiredAction[]
  round_requirements?: { action_type: string; done: boolean }[]
}

export interface VoteCastEvent {
  type: 'vote_cast'
  actor_id: number
  target_id: number
}

export interface VoteResultStartedEvent {
  type: 'vote_result_started'
  lynch_target_id: number
  logs: GameLogEntry[]
  required_actions: RequiredAction[]
  round_requirements?: { action_type: string; done: boolean }[]
}

export interface GameStatePlayer {
  id: number
  code: string
  status: 'alive' | 'dead'
  /** Public username, resolved from the room session. */
  name?: string | null
  /** Set for dead players — role reveal persists across reconnects. */
  role_code?: string | null
  role_name?: string | null
}

export interface GameResetEvent {
  type: 'game_reset'
  player_ids: number[]
  session_id: string
  host: number
  alive_ids: number[]
  players: GameStatePlayer[]
  required_actions: RequiredAction[]
  round_requirements?: { action_type: string; done: boolean }[]
}

export interface GameCanceledEvent {
  type: 'game_canceled'
}

export interface GameOverEvent {
  type: 'game_over'
  winner: Winner
  player_ids: number[]
  logs: GameLogEntry[]
}

export interface DetectResultEvent {
  type: 'detect_result'
  target_id: number
  role_type: string
}

export interface GameStateEvent {
  type: 'game_state'
  session_id: string | null
  players: GameStatePlayer[]
  live_player_ids: number[]
  dead_player_ids: number[]
  current_phase: string | null
  round_number: number | null
  lynch_target_id: number | null
  logs: GameLogEntry[]
  role_code: string | null
  role_name: string | null
  role_type: string | null
  role_description: string | null
  mafia_ids: number[] | null
  required_actions: RequiredAction[]
  round_requirements?: { action_type: string; done: boolean }[]
}

// ── Game Inbound (client → server) ──

export interface StartGameMessage {
  type: 'start_game'
  player_ids: number[]
}

export interface VoteMessage {
  type: 'vote'
  target_id: number
}

export interface KillMessage {
  type: 'kill'
  target_id: number
}

export interface HealMessage {
  type: 'heal'
  target_id: number
}

export interface DetectMessage {
  type: 'detect'
  target_id: number
}

export interface ShootMessage {
  type: 'shoot'
  target_id: number
}

export interface RevengeMessage {
  type: 'revenge'
  target_id: number
}

export interface SilenceMessage {
  type: 'silence'
  target_id: number
}

export interface SubmitVotesMessage {
  type: 'submit_votes'
}

export interface SubmitVoteResultMessage {
  type: 'submit_vote_result'
}

export interface ResetGameMessage {
  type: 'reset'
}

export interface CancelGameMessage {
  type: 'cancel'
}
