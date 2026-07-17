import { useRef, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  RealtimeKitProvider,
} from '@cloudflare/realtimekit-react'
import {
  RtkUiProvider,
  RtkParticipantsAudio,
  RtkDialogManager,
  RtkNotifications,
} from '@cloudflare/realtimekit-react-ui'
import { useMeetingContext } from '#/features/rooms/context/meeting-context'
import { RoomContextProvider } from '#/features/rooms/context/room-context'
import { RoomActiveState } from '#/features/rooms/states/room-active-state'

export const Route = createFileRoute('/rooms/$roomId/live')({
  component: LiveRoute,
})

function LiveRoute() {
  const { roomId } = Route.useParams()
  const {
    meeting,
    meetingInstance,
    joinRequests,
    dismissJoinRequest,
    acceptJoinRequest,
    rejectJoinRequest,
  } = useMeetingContext()

  const navigate = useNavigate()
  const fullScreenRef = useRef<HTMLDivElement>(null)
  const activeMeeting = meetingInstance || meeting

  // Guard: redirect to /join if no meeting initialized (e.g. direct link to /live)
  useEffect(() => {
    if (!activeMeeting) {
      navigate({ to: '/rooms/$roomId/join', params: { roomId }, replace: true })
    }
  }, [activeMeeting, navigate, roomId])

  const handleStatesUpdate = (event: { detail: { meeting?: string } }) => {
    if (event.detail.meeting === 'ended') {
      navigate({ to: '/rooms/$roomId/ended', params: { roomId }, replace: true })
    }
  }

  if (!activeMeeting) {
    return null
  }

  const roomContextValue = {
    joinRequests,
    dismissJoinRequest,
    acceptJoinRequest,
    rejectJoinRequest,
  }

  return (
    <div className="flex flex-col h-screen bg-[#161618]">
      <RealtimeKitProvider value={activeMeeting}>
        <RoomContextProvider value={roomContextValue}>
          <RtkUiProvider
            ref={fullScreenRef}
            meeting={activeMeeting}
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
