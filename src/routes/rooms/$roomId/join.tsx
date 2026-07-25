import { useEffect, useState, useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { MeetingSetupState } from '#/features/rooms/states/meeting-setup-state'

export const Route = createFileRoute('/rooms/$roomId/join')({
  component: JoinRoute,
})

function JoinRoute() {
  const navigate = useNavigate()
  const roomId = useMeetingStore((s) => s.roomId)
  const wsState = useMeetingStore((s) => s.wsState)
  const reconnect = useMeetingStore((s) => s.reconnect)
  const sendJoinRequest = useMeetingStore((s) => s.sendJoinRequest)
  const joinRequestStatus = useMeetingStore((s) => s.joinRequestStatus)
  const setJoinRequestStatus = useMeetingStore((s) => s.setJoinRequestStatus)
  const meetingInstance = useMeetingStore((s) => s.meetingInstance)
  const setMeetingInstance = useMeetingStore((s) => s.setMeetingInstance)
  const initMeeting = useMeetingStore((s) => s.initMeeting)
  const authToken = useMeetingStore((s) => s.authToken)
  const isReturningUser = useMeetingStore((s) => s.isReturningUser)

  const [initError, setInitError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  // Auto-join for returning users — skip the "Join meeting" button entirely.
  useEffect(() => {
    if (!isReturningUser || !authToken || meetingInstance || initError) return

    setIsJoining(true)
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
        setIsJoining(false)
      })
  }, [isReturningUser, authToken, meetingInstance, initError, initMeeting, navigate, setMeetingInstance, roomId])

  // For new users: when host accepts join request AND we have credentials, init + join.
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
  }, [joinRequestStatus, authToken, meetingInstance, initError, initMeeting, isReturningUser, navigate, setMeetingInstance, roomId])

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
