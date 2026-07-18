import { createContext, useContext } from 'react'
import type { JoinRequest } from '../hooks/use-room-state'
import type { Participant } from '../components/participant-list'

interface RoomContextValue {
  joinRequests: JoinRequest[]
  dismissJoinRequest: (userId: number) => void
  acceptJoinRequest: (userId: number) => void
  rejectJoinRequest: (userId: number) => void
  participants: Participant[]
  isHost: boolean
}

const RoomContext = createContext<RoomContextValue | null>(null)

export function RoomContextProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: RoomContextValue
}) {
  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export function useRoomContext() {
  const ctx = useContext(RoomContext)
  if (!ctx) throw new Error('useRoomContext must be used within RoomContextProvider')
  return ctx
}
