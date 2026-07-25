import { create } from 'zustand'
import type RTKClient from '@cloudflare/realtimekit'
import type { WsState } from '../hooks/use-room-websocket'
import type { RoomStateEvent } from '../events'
import type { JoinRequest } from '../hooks/use-room-state'
import type { Participant } from '../components/participant-list'

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
  setJoinRequestStatus: (status: 'idle' | 'requested' | 'accepted' | 'rejected') => void
  meeting: RTKClient | undefined
  initMeeting: (options: { authToken: string }) => Promise<RTKClient | undefined>
  meetingInstance: RTKClient | null
  setMeetingInstance: (instance: RTKClient | null) => void
  authToken: string | null
  isReturningUser: boolean
  participants: Participant[]
  isHost: boolean
}

export const useMeetingStore = create<MeetingStore>(() => ({
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
  meeting: undefined,
  initMeeting: async () => undefined,
  meetingInstance: null,
  setMeetingInstance: () => {},
  authToken: null,
  isReturningUser: false,
  participants: [],
  isHost: false,
}))
