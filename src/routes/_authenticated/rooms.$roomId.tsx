import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  useRealtimeKitClient,
  RealtimeKitProvider,
} from '@cloudflare/realtimekit-react'
import {
  RtkUiProvider,
  RtkParticipantsAudio,
  RtkDialogManager,
  RtkNotifications,
} from '@cloudflare/realtimekit-react-ui'
import type { States } from '@cloudflare/realtimekit-react-ui'
import { Loader2, Wifi } from 'lucide-react'
import { useRoomWebSocket } from '#/features/rooms/hooks/use-room-websocket'
import { useRoomState } from '#/features/rooms/hooks/use-room-state'
import { RoomClosedState } from '#/features/rooms/states/room-closed-state'
import { RoomActiveState } from '#/features/rooms/states/room-active-state'
import { MeetingSetupState } from '#/features/rooms/states/meeting-setup-state'
import { MeetingEndedState } from '#/features/rooms/states/meeting-ended-state'
import { RoomContextProvider } from '#/features/rooms/context/room-context'

export const Route = createFileRoute('/_authenticated/rooms/$roomId')({
  component: MeetingRoomPage,
})

function MeetingRoomPage() {
  const { roomId } = Route.useParams()
  const {
    state: wsState,
    lastMessage,
    reconnect,
    wasEverOpen,
    acceptJoinRequest,
    rejectJoinRequest,
    sendJoinRequest,
  } = useRoomWebSocket(roomId)
  const {
    roomState,
    roomClosed,
    joinRequests,
    dismissJoinRequest,
    joinRequestStatus,
    setJoinRequestStatus,
    currentUser,
  } = useRoomState(lastMessage)

  const [meeting, initMeeting] = useRealtimeKitClient()
  const [initError, setInitError] = useState<string | null>(null)
  const [meetingState, setMeetingState] = useState('idle')
  const [uiStates, setUiStates] = useState<States | null>(null)
  const fullScreenRef = useRef<HTMLDivElement>(null)

  const isReturningUser =
    currentUser && roomState?.members
      ? roomState.members.includes(Number(currentUser.id))
      : false

  const authToken = roomState?.credentials?.token ?? null

  // Auto-init meeting as soon as we have the auth token
  useEffect(() => {
    if (authToken && !meeting && !initError) {
      initMeeting({ authToken }).catch((err: unknown) => {
        setInitError(
          err instanceof Error ? err.message : 'Failed to connect to meeting.',
        )
      })
    }
  }, [authToken, meeting, initError, initMeeting])

  // Auto-join when host accepts the join request
  useEffect(() => {
    if (joinRequestStatus === 'accepted' && meeting) {
      meeting.join().catch(() => {})
    }
  }, [joinRequestStatus, meeting])

  const handleStatesUpdate = (event: { detail: States }) => {
    setUiStates(event.detail)
    const state = event.detail.meeting

    if (state === 'idle' && meetingState !== 'idle') setMeetingState('idle')
    else if (state === 'setup' && meetingState !== 'setup') setMeetingState('setup')
    else if (state === 'waiting' && meetingState !== 'waiting') setMeetingState('waiting')
    else if (state === 'joined' && meetingState !== 'joined') setMeetingState('joined')
    else if (state === 'ended' && meetingState !== 'ended') setMeetingState('ended')
  }

  // ── Room closed (host ended the room) ──
  if (roomClosed) {
    return <RoomClosedState />
  }

  // ── RTK init error ──
  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#161618]">
        <p className="text-red-400">{initError}</p>
      </div>
    )
  }

  const showSetup = meetingState === 'idle' || meetingState === 'setup' || meetingState === 'waiting'

  // ── Loading: waiting for auth token and meeting init ──
  if (!meeting && showSetup) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#161618]">
        <div className="w-full max-w-lg mx-auto px-6 py-10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-[#f4f4f5]">Join room</h2>
            <span className="inline-block font-mono text-sm text-[#60a5fa] bg-[#212124] px-3 py-1 rounded-lg">
              #{roomId}
            </span>
            <p className="text-sm text-[#a1a1aa]">
              {!authToken ? 'Establishing connection...' : 'Setting up your media...'}
            </p>
            {wsState === 'error' && (
              <p className="text-sm text-red-400">Connection lost. Please retry.</p>
            )}
          </div>

          <div className="relative bg-[#212124] rounded-xl overflow-hidden aspect-video ring-1 ring-white/5">
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#212124] to-[#161618] gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#71717a]" />
              <span className="text-sm text-[#71717a]">
                {!authToken ? 'Connecting to room...' : 'Initializing media...'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full h-12 rounded-lg bg-[#60a5fa]/50 text-white/50 font-medium text-sm flex items-center justify-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up...
            </button>

            {wsState === 'error' && (
              <button
                type="button"
                onClick={reconnect}
                className="w-full h-12 rounded-lg bg-white/5 hover:bg-white/10 text-[#f4f4f5] font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Wifi className="h-4 w-4" />
                Reconnect
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const roomContextValue = {
    joinRequests,
    dismissJoinRequest,
    acceptJoinRequest,
    rejectJoinRequest,
  }

  // ── Joined ──
  if (meetingState === 'joined' && uiStates) {
    return (
      <div className="flex flex-col h-screen bg-[#161618]">
        <RealtimeKitProvider value={meeting}>
          <RoomContextProvider value={roomContextValue}>
            <RtkUiProvider
              ref={fullScreenRef}
              meeting={meeting}
              showSetupScreen={false}
              onRtkStatesUpdate={handleStatesUpdate}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                margin: 0,
              }}
            >
              <RoomActiveState fullScreenRef={fullScreenRef} roomId={roomId} />
              <RtkParticipantsAudio />
              <RtkDialogManager />
              <RtkNotifications />
            </RtkUiProvider>
          </RoomContextProvider>
        </RealtimeKitProvider>
      </div>
    )
  }

  // ── Meeting ended ──
  if (meetingState === 'ended') {
    return <MeetingEndedState />
  }

  // ── Meeting ready, setup/waiting ──
  return (
    <div className="flex flex-col h-screen bg-[#161618]">
      <RealtimeKitProvider value={meeting}>
        <div className="flex flex-col h-full w-full relative overflow-hidden">
          <RoomContextProvider value={roomContextValue}>
            <RtkUiProvider
              ref={fullScreenRef}
              meeting={meeting}
              showSetupScreen={true}
              onRtkStatesUpdate={handleStatesUpdate}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                margin: 0,
              }}
            >
              <div id="meeting-container" className="flex flex-col flex-1 h-full w-full">
                <MeetingSetupState
                  roomId={roomId}
                  isReturningUser={isReturningUser || wasEverOpen}
                  joinRequestStatus={joinRequestStatus}
                  onSendJoinRequest={() => {
                    setJoinRequestStatus('requested')
                    sendJoinRequest()
                  }}
                />

                {meetingState === 'joined' && uiStates && (
                  <RoomActiveState fullScreenRef={fullScreenRef} roomId={roomId} />
                )}
              </div>

              <RtkParticipantsAudio />
              <RtkDialogManager />
              <RtkNotifications />
            </RtkUiProvider>
          </RoomContextProvider>
        </div>
      </RealtimeKitProvider>
    </div>
  )
}
