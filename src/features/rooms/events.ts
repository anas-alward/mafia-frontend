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
