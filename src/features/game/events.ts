// ── Game types ──

export type GamePhase = 'lobby' | 'day' | 'night' | 'vote_result' | 'ended'

export interface GameLogEntry {
  actor_id: number
  target_id: number
  action_type: string
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
}

export interface RoleAssignedEvent {
  type: 'role_assigned'
  role_name: string
  description: string
  role_type: string
  mafia_ids?: number[]
}

export interface SunRiseEvent {
  type: 'sun_rise'
  player_ids: number[]
  logs: GameLogEntry[]
  required_actions: RequiredAction[]
}

export interface SunSetEvent {
  type: 'sun_set'
  player_ids: number[]
  logs: GameLogEntry[]
  required_actions: RequiredAction[]
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
}

export interface GameStatePlayer {
  id: number
  code: string
  status: 'alive' | 'dead'
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
  role_name: string | null
  role_type: string | null
  role_description: string | null
  mafia_ids: number[] | null
  required_actions: RequiredAction[]
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

export interface SilentMessage {
  type: 'silent'
  target_id: number | null
}

export interface RoleblockMessage {
  type: 'roleblock'
  target_id: number
}

export interface SubmitVotesMessage {
  type: 'submit_votes'
}

export interface SubmitVoteResultMessage {
  type: 'submit_vote_result'
}
