// ── Outbound (server → client) ──

export interface RoomStateCredentials {
  participant_id: string
  token: string
}

export interface RoomStateEvent {
  type: 'room_state'
  credentials: RoomStateCredentials
  room_id: number | null
  room_name: string | null
  host_id: number | null
  members: number[]
}

export interface PlayerJoinedEvent {
  type: 'player_joined'
  user_id: number
  username: string
  member_count: number
}

export interface PlayerLeftEvent {
  type: 'player_left'
  user_id: number
  username: string
  member_count: number
}

export interface HostChangedEvent {
  type: 'host_changed'
  new_host_id: number
  new_host_username: string
  reason: string
}

export interface RoomClosedEvent {
  type: 'room_closed'
  room_code: string
}

export interface ChatMessageEvent {
  type: 'chat_message'
  user_id: number
  username: string
  message: string
}

export interface JoinRequestReceivedEvent {
  type: 'join_request_received'
  user_id: number
  username: string
}

export interface JoinRequestAcceptedEvent {
  type: 'join_request_accepted'
  user_id: number
}

export interface JoinRequestRejectedEvent {
  type: 'join_request_rejected'
  user_id: number
}

// ── Inbound (client → server) ──

export interface AcceptJoinRequest {
  type: 'accept_join_request'
  user_id: number
}

export interface RejectJoinRequest {
  type: 'reject_join_request'
  user_id: number
}

export interface CloseRoom {
  type: 'close_room'
}

export interface SendJoinRequest {
  type: 'join_request'
  room_code: string
}

export interface ChatSend {
  type: 'chat'
  message: string
}

// ── Game types ──

export type GamePhase = 'lobby' | 'day' | 'night' | 'vote_result' | 'ended'

export interface GameLogEntry {
  message: string
  [key: string]: unknown
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
}

export interface SunSetEvent {
  type: 'sun_set'
  player_ids: number[]
  logs: GameLogEntry[]
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

export interface SubmitVotesMessage {
  type: 'submit_votes'
}

export interface SubmitVoteResultMessage {
  type: 'submit_vote_result'
}
