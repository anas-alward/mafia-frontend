import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useMediaConfigStore } from '#/features/rooms/store/media-config-store'
import { JoinButton } from '#/features/rooms/components/join/join-button'
import { AudioToggleButton } from '#/features/rooms/components/media/audio-toggle-button'
import { VideoToggleButton } from '#/features/rooms/components/media/video-toggle-button'
import { AudioDeviceSelect } from '#/features/rooms/components/media/audio-device-select'
import { VideoDeviceSelect } from '#/features/rooms/components/media/video-device-select'
import { VideoPreview } from '#/features/rooms/components/media/video-preview'

export const Route = createFileRoute('/rooms/$roomId/join')({
  component: JoinRoute,
})

function JoinRoute() {
  const mediaDisabled = import.meta.env.VITE_DISABLE_MEDIA === 'true'

  const navigate = useNavigate()
  const roomId = useMeetingStore((s) => s.roomId)
  const isReturningUser = useMeetingStore((s) => s.isReturningUser)
  const authToken = useMeetingStore((s) => s.authToken)
  const joinRequestStatus = useMeetingStore((s) => s.joinRequestStatus)
  const initMeeting = useMeetingStore((s) => s.initMeeting)
  const meetingInstance = useMeetingStore((s) => s.meetingInstance)
  const setMeetingInstance = useMeetingStore((s) => s.setMeetingInstance)

  const mediaError = useMediaConfigStore((s) => s.mediaError)
  const startCamera = useMediaConfigStore((s) => s.startCamera)
  const stopCamera = useMediaConfigStore((s) => s.stopCamera)

  const [isJoining, setIsJoining] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  const doJoin = useCallback(
    (token: string) => {
      setIsJoining(true)
      initMeeting({ authToken: token })
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
            err instanceof Error
              ? err.message
              : 'Failed to connect to meeting.',
          )
          setIsJoining(false)
        })
    },
    [roomId, initMeeting, setMeetingInstance, navigate],
  )

  // Auto-join for returning users (room_state includes this user in members)
  useEffect(() => {
    if (!isReturningUser || !authToken || meetingInstance || initError) return
    doJoin(authToken)
  }, [isReturningUser, authToken, meetingInstance, initError, doJoin])

  // Auto-join when host accepts join request
  useEffect(() => {
    if (
      joinRequestStatus !== 'accepted' ||
      !authToken ||
      meetingInstance ||
      initError ||
      isReturningUser
    )
      return
    doJoin(authToken)
  }, [
    joinRequestStatus,
    authToken,
    meetingInstance,
    initError,
    isReturningUser,
    doJoin,
  ])

  const dismissError = useCallback(() => setInitError(null), [])

  useEffect(() => {
    if (mediaDisabled) {
      useMediaConfigStore.setState({
        mediaReady: true,
        videoEnabled: false,
        audioEnabled: false,
      })
      return
    }
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="flex items-center justify-center h-screen bg-[#161618]">
      <div className="w-full max-w-lg mx-auto px-6 py-10 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-[#f4f4f5]">
            {isReturningUser ? 'Welcome back' : 'Ready to join?'}
          </h2>
          <span className="inline-block font-mono text-sm text-[#60a5fa] bg-[#212124] px-3 py-1 rounded-lg">
            #{roomId}
          </span>
          <p className="text-sm text-[#a1a1aa]">
            {isReturningUser
              ? 'Set up your audio and video before joining.'
              : 'Set up your audio and video, then ask to join.'}
          </p>
          {mediaError && <p className="text-sm text-amber-400">{mediaError}</p>}
        </div>

        <VideoPreview />

        <div className="grid grid-cols-2 gap-4">
          <VideoDeviceSelect />
          <AudioDeviceSelect />
        </div>

        <div className="flex items-center justify-center gap-4">
          <AudioToggleButton />
          <VideoToggleButton />
        </div>

        <JoinButton
          isJoining={isJoining}
          initError={initError}
          onJoin={doJoin}
          onDismissError={dismissError}
        />
      </div>
    </div>
  )
}
