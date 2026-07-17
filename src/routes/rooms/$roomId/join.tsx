import { useEffect, useState, useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMeetingContext } from '#/features/rooms/context/meeting-context'
import { MeetingSetupState } from '#/features/rooms/states/meeting-setup-state'

export const Route = createFileRoute('/rooms/$roomId/join')({
  component: JoinRoute,
})

function JoinRoute() {
  const navigate = useNavigate()
  const {
    roomId,
    wsState,
    reconnect,
    sendJoinRequest,
    joinRequestStatus,
    setJoinRequestStatus,
    meetingInstance,
    setMeetingInstance,
    initMeeting,
    authToken,
    isReturningUser,
  } = useMeetingContext()

  const [initError, setInitError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  // For new users: when host accepts join request AND we have credentials, init + join.
  // Skip returning users — they must click "Join meeting" explicitly.
  useEffect(() => {
    if (joinRequestStatus !== 'accepted' || !authToken || meetingInstance || initError || isReturningUser) return

    initMeeting({ authToken })
      .then((result) => {
        if (result) {
          setMeetingInstance(result)
          return result.join()
        }
      })
      .then(() => {
        navigate({ to: '/rooms/$roomId/live', params: { roomId } })
      })
      .catch((err: unknown) => {
        setInitError(
          err instanceof Error ? err.message : 'Failed to connect to meeting.',
        )
      })
  }, [joinRequestStatus, authToken, meetingInstance, initError, initMeeting, isReturningUser, navigate, setMeetingInstance])

  const handleJoin = useCallback(async () => {
    setInitError(null)

    if (isReturningUser) {
      if (!authToken) return
      setIsJoining(true)
      try {
        const result = await initMeeting({ authToken })
        if (result) {
          setMeetingInstance(result)
          await result.join()
          navigate({ to: '/rooms/$roomId/live', params: { roomId } })
        }
      } catch (err: unknown) {
        setInitError(
          err instanceof Error ? err.message : 'Failed to connect to meeting.',
        )
      } finally {
        setIsJoining(false)
      }
    } else {
      setJoinRequestStatus('requested')
      sendJoinRequest()
    }
  }, [authToken, isReturningUser, initMeeting, sendJoinRequest, setJoinRequestStatus, navigate, setMeetingInstance])

  // RTK init error
  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#161618]">
        <div className="text-center space-y-4">
          <p className="text-red-400">{initError}</p>
          <button
            type="button"
            onClick={() => {
              setInitError(null)
              setJoinRequestStatus('idle')
            }}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#f4f4f5] text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#161618]">
      <MeetingSetupState
        roomId={roomId}
        isReturningUser={isReturningUser}
        joinRequestStatus={joinRequestStatus}
        wsState={wsState}
        onReconnect={reconnect}
        authToken={authToken}
        onJoin={handleJoin}
        isJoining={isJoining}
      />
    </div>
  )
}
