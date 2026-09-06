import { useState, useEffect, useCallback, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Room } from 'livekit-client'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useMediaConfigStore } from '#/features/rooms/store/media-config-store'
import {
  AudioDeviceSelect,
  AudioToggleButton,
  JoinButton,
  VideoDeviceSelect,
  VideoPreview,
  VideoToggleButton,
} from '#/features/rooms/components'

export const Route = createFileRoute('/rooms/$roomId/join')({
  component: JoinRoute,
})

function JoinRoute() {
  const mediaDisabled = import.meta.env.VITE_DISABLE_MEDIA === 'true'

  const navigate = useNavigate()
  const roomId = useMeetingStore((s) => s.roomId)
  const isReturningUser = useMeetingStore((s) => s.isReturningUser)
  const authToken = useMeetingStore((s) => s.authToken)
  const serverUrl = useMeetingStore((s) => s.serverUrl)
  const joinRequestStatus = useMeetingStore((s) => s.joinRequestStatus)
  const room = useMeetingStore((s) => s.room)

  const mediaError = useMediaConfigStore((s) => s.mediaError)
  const startCamera = useMediaConfigStore((s) => s.startCamera)
  const stopCamera = useMediaConfigStore((s) => s.stopCamera)

  const [isJoining, setIsJoining] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  // Synchronous mutex — the async connect leaves a window where `room` is
  // still null; without this, a re-fired effect or double click connects a
  // second Room with the same identity and the server kills both
  // (DUPLICATE_IDENTITY), creating an endless reconnect fight.
  const joiningRef = useRef(false)

  const doJoin = useCallback(
    async (token: string) => {
      if (!serverUrl || joiningRef.current || useMeetingStore.getState().room)
        return
      joiningRef.current = true
      setIsJoining(true)

      const media = useMediaConfigStore.getState()

      const lkRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          deviceId: media.selectedAudioDevice || undefined,
        },
        videoCaptureDefaults: {
          deviceId: media.selectedVideoDevice || undefined,
        },
      })

      try {
        await lkRoom.connect(serverUrl, token, { autoSubscribe: true })

        if (!mediaDisabled) {
          if (media.audioEnabled) {
            await lkRoom.localParticipant.setMicrophoneEnabled(true)
          }
          if (media.videoEnabled) {
            await lkRoom.localParticipant.setCameraEnabled(true)
          }
        }

        useMeetingStore.getState().setRoom(lkRoom)
        stopCamera()
        navigate({ to: '/rooms/$roomId/live', params: { roomId } })
      } catch (err: unknown) {
        // Stop the SDK from auto-reconnecting a half-open connection
        lkRoom.disconnect()
        setInitError(
          err instanceof Error ? err.message : 'Failed to connect to meeting.',
        )
        setIsJoining(false)
        joiningRef.current = false
      }
    },
    [roomId, serverUrl, stopCamera, navigate],
  )

  // Auto-join for returning users (room_state includes this user in members)
  useEffect(() => {
    if (!isReturningUser || !authToken || room || initError) return
    doJoin(authToken)
  }, [isReturningUser, authToken, room, initError, doJoin])

  // Auto-join when host accepts join request
  useEffect(() => {
    if (
      joinRequestStatus !== 'accepted' ||
      !authToken ||
      room ||
      initError ||
      isReturningUser
    )
      return
    doJoin(authToken)
  }, [joinRequestStatus, authToken, room, initError, isReturningUser, doJoin])

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
