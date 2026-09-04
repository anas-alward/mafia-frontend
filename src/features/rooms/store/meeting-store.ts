import { create } from 'zustand'
import type { Room } from 'livekit-client'
import type { WsState } from '../hooks/use-room-websocket'
import type { RoomStateEvent } from '../events'
import type { JoinRequest } from '../hooks/use-room-state'
import type { Participant } from '../types'

interface MeetingStore {
  roomId: string
  wsState: WsState
  sendError: string | null
  reconnect: () => void
  sendJoinRequest: () => void
  roomState: RoomStateEvent | null
  joinRequests: JoinRequest[]
  dismissJoinRequest: (userId: number) => void
  acceptJoinRequest: (userId: number) => void
  rejectJoinRequest: (userId: number) => void
  joinRequestStatus: 'idle' | 'requested' | 'accepted' | 'rejected'
  setJoinRequestStatus: (
    status: 'idle' | 'requested' | 'accepted' | 'rejected',
  ) => void
  /** LiveKit room instance — set once the media connection is established. */
  room: Room | null
  setRoom: (room: Room | null) => void
  authToken: string | null
  serverUrl: string | null
  isReturningUser: boolean
  participants: Participant[]
  isHost: boolean
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  roomId: '',
  wsState: 'connecting',
  sendError: null,
  reconnect: () => {},
  sendJoinRequest: () => {},
  roomState: null,
  joinRequests: [],
  dismissJoinRequest: () => {},
  acceptJoinRequest: () => {},
  rejectJoinRequest: () => {},
  joinRequestStatus: 'idle',
  setJoinRequestStatus: () => {},
  room: null,
  setRoom: (room) => set({ room }),
  authToken: null,
  serverUrl: null,
  isReturningUser: false,
  participants: [],
  isHost: false,
}))
