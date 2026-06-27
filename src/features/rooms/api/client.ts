import { request } from '#/lib/api-client'
import type {
  RoomDto,
  CreateRoomRequest,
  AddMemberRequest,
} from '../types'

export async function getRoom(code: string) {
  return request<{ room: RoomDto }>(`/rooms/${code}/`)
}

export async function createRoom(body: CreateRoomRequest) {
  return request<{ room: RoomDto }>('/rooms/create/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function addMember(roomCode: string, body: AddMemberRequest) {
  return request<{ room: RoomDto }>(`/rooms/${roomCode}/members/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
