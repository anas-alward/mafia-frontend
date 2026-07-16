import { useCallback } from 'react'
import type { JoinRequest } from './use-room-state'

interface UseJoinRequestsInput {
  joinRequests: JoinRequest[]
  dismissJoinRequest: (userId: number) => void
  acceptJoinRequest: (userId: number) => void
  rejectJoinRequest: (userId: number) => void
}

export function useJoinRequests({
  joinRequests,
  dismissJoinRequest,
  acceptJoinRequest,
  rejectJoinRequest,
}: UseJoinRequestsInput) {
  const handleAccept = useCallback(
    (userId: number) => {
      dismissJoinRequest(userId)
      acceptJoinRequest(userId)
    },
    [dismissJoinRequest, acceptJoinRequest],
  )

  const handleReject = useCallback(
    (userId: number) => {
      dismissJoinRequest(userId)
      rejectJoinRequest(userId)
    },
    [dismissJoinRequest, rejectJoinRequest],
  )

  return {
    joinRequests,
    acceptJoinRequest: handleAccept,
    rejectJoinRequest: handleReject,
  }
}
