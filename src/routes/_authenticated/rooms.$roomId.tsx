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
import { useRoomWebSocket } from '#/features/rooms/hooks/use-room-websocket'
import { useRoomState } from '#/features/rooms/hooks/use-room-state'
import { RoomClosedState } from '#/features/rooms/states/room-closed-state'
import { RoomConnectingState } from '#/features/rooms/states/room-connecting-state'
import { RoomErrorState } from '#/features/rooms/states/room-error-state'
import { RoomWaitingState } from '#/features/rooms/states/room-waiting-state'
import { RoomActiveState } from '#/features/rooms/states/room-active-state'
import { MeetingIdleState } from '#/features/rooms/states/meeting-idle-state'
import { MeetingSetupState } from '#/features/rooms/states/meeting-setup-state'
import { MeetingWaitingState } from '#/features/rooms/states/meeting-waiting-state'
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
    acceptJoinRequest,
    rejectJoinRequest,
  } = useRoomWebSocket(roomId)
  const { roomState, roomClosed, joinRequests, dismissJoinRequest } =
    useRoomState(lastMessage)

  const [meeting, initMeeting] = useRealtimeKitClient()
  const [initError, setInitError] = useState<string | null>(null)
  const [meetingState, setMeetingState] = useState('idle')
  const [uiStates, setUiStates] = useState<States | null>(null)
  const fullScreenRef = useRef<HTMLDivElement>(null)

  // Init RealtimeKit meeting when room credentials arrive
  useEffect(() => {
    if (!roomState?.credentials) return
    if (meeting) return

    initMeeting({ authToken: roomState.credentials.token })
      .then((result) => {
        if (!result) return
      })
      .catch((err: unknown) => {
        setInitError(
          err instanceof Error ? err.message : 'Failed to connect to meeting.',
        )
      })
  }, [roomState?.credentials.token, meeting, initMeeting])

  const handleStatesUpdate = (event: { detail: States }) => {
    setUiStates(event.detail)
    const state = event.detail.meeting

    if (state === 'idle' && meetingState !== 'idle') setMeetingState('idle')
    else if (state === 'setup' && meetingState !== 'setup') setMeetingState('setup')
    else if (state === 'waiting' && meetingState !== 'waiting') setMeetingState('waiting')
    else if (state === 'joined' && meetingState !== 'joined') setMeetingState('joined')
    else if (state === 'ended' && meetingState !== 'ended') setMeetingState('ended')
  }

  // ── Room-closed (host ended the room) ──
  if (roomClosed) {
    return <RoomClosedState />
  }

  // ── RealtimeKit init error ──
  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-red-500">{initError}</p>
      </div>
    )
  }

  // ── WS states (no roomState yet) ──
  if (!roomState) {
    if (wsState === 'connecting') return <RoomConnectingState roomId={roomId} />
    if (wsState === 'error') return <RoomErrorState onReconnect={reconnect} />
    return <RoomWaitingState roomId={roomId} />
  }


  // ── Meeting ready, wrap in providers ──
  return (
    <div className="flex flex-col h-screen bg-white">
      <RealtimeKitProvider value={meeting}>
        <div className="flex flex-col h-full w-full relative overflow-hidden bg-white">
          <RoomContextProvider
            value={{
              joinRequests,
              dismissJoinRequest,
              acceptJoinRequest,
              rejectJoinRequest,
            }}
          >
            <RtkUiProvider
              ref={fullScreenRef}
              meeting={meeting}
              showSetupScreen={true}
              onRtkStatesUpdate={handleStatesUpdate}
              className={'bg-white'}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                margin: 0,
              }}
            >
              <div id="meeting-container" className="flex flex-col flex-1 h-full w-full">
                {meetingState === 'idle' && <MeetingIdleState />}
                {meetingState === 'setup' && <MeetingSetupState />}
                {meetingState === 'waiting' && <MeetingWaitingState />}

                {meetingState === 'joined' && uiStates && (
                  <RoomActiveState fullScreenRef={fullScreenRef} roomId={roomId} />
                )}

                {meetingState === 'ended' && <MeetingEndedState />}
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
