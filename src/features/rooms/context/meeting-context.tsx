import { createContext, useContext } from 'react'
import type RTKClient from '@cloudflare/realtimekit'
import type { WsState } from '../hooks/use-room-websocket'
import type { RoomStateEvent } from '../events'
import type { JoinRequest } from '../hooks/use-room-state'

export interface MeetingContextValue {
  roomId: string
  wsState: WsState
  reconnect: () => void
  sendJoinRequest: () => void
  roomState: RoomStateEvent | null
  joinRequests: JoinRequest[]
  dismissJoinRequest: (userId: number) => void
  acceptJoinRequest: (userId: number) => void
  rejectJoinRequest: (userId: number) => void
  joinRequestStatus: 'idle' | 'requested' | 'accepted' | 'rejected'
  setJoinRequestStatus: React.Dispatch<React.SetStateAction<'idle' | 'requested' | 'accepted' | 'rejected'>>
  meeting: RTKClient | undefined
  initMeeting: (options: { authToken: string }) => Promise<RTKClient | undefined>
  meetingInstance: RTKClient | null
  setMeetingInstance: React.Dispatch<React.SetStateAction<RTKClient | null>>
  authToken: string | null
  isReturningUser: boolean
}

const MeetingContext = createContext<MeetingContextValue | null>(null)

export function MeetingContextProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: MeetingContextValue
}) {
  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
}

export function useMeetingContext() {
  const ctx = useContext(MeetingContext)
  if (!ctx) throw new Error('useMeetingContext must be used within MeetingContextProvider')
  return ctx
}
