// Domain types for the rooms feature — 004-meet-lobby-refactor

/** Public room data — camelCase domain representation */
export interface Room {
  id: number
  name: string
  code: string
  host: string
  maxMembers: number
  status: string
  meetingId: string
  scheduledAt: string | null
  roleConfiguration: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ── Transport types (snake_case, matching Django API) ──

export interface RoomDto {
  id: number
  name: string
  code: string
  host: string
  max_members: number
  status: string
  meeting_id: string
  scheduled_at: string | null
  role_configuration: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ── Request types ──

export interface CreateRoomRequest {
  name: string
  max_members: number
}

export interface AddMemberRequest {
  user_id: string
}

// ── Mappers ──

export function mapRoomDto(dto: RoomDto): Room {
  return {
    id: dto.id,
    name: dto.name,
    code: dto.code,
    host: dto.host,
    maxMembers: dto.max_members,
    status: dto.status,
    meetingId: dto.meeting_id,
    scheduledAt: dto.scheduled_at,
    roleConfiguration: dto.role_configuration,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}
