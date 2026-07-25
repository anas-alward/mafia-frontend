import { useRef, useEffect, useCallback } from 'react'
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
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { RoomActiveState } from '#/features/rooms/states/room-active-state'
import { SidebarProvider, SidebarInset } from '#/components/ui/sidebar'
import { JoinRequestsSidebar } from '#/features/rooms/components/live/join-requests-sidebar'

export const Route = createFileRoute('/rooms/$roomId/live')({
  component: LiveRoute,
})

function LiveRoute() {
  const { roomId } = Route.useParams()
  const meeting = useMeetingStore((s) => s.meeting)
  const meetingInstance = useMeetingStore((s) => s.meetingInstance)
  const joinRequests = useMeetingStore((s) => s.joinRequests)
  const dismissJoinRequest = useMeetingStore((s) => s.dismissJoinRequest)
  const acceptJoinRequest = useMeetingStore((s) => s.acceptJoinRequest)
  const rejectJoinRequest = useMeetingStore((s) => s.rejectJoinRequest)
  const participants = useMeetingStore((s) => s.participants)
  const isHost = useMeetingStore((s) => s.isHost)
  const wsState = useMeetingStore((s) => s.wsState)
  const sendError = useMeetingStore((s) => s.sendError)

  const navigate = useNavigate()
  const fullScreenRef = useRef<HTMLDivElement>(null)
  const activeMeeting = meetingInstance || meeting

  // Guard: redirect to /join if no meeting initialized (e.g. direct link to /live)
  useEffect(() => {
    if (!activeMeeting) {
      navigate({ to: '/rooms/$roomId/join', params: { roomId }, replace: true })
    }
  }, [activeMeeting, navigate, roomId])

  const handleStatesUpdate = useCallback(
    (event: { detail: { meeting?: string } }) => {
      if (event.detail.meeting === 'ended') {
        navigate({ to: '/rooms/$roomId/ended', params: { roomId }, replace: true })
      }
    },
    [navigate, roomId],
  )

  if (!activeMeeting) {
    return null
  }

  return (
    <RealtimeKitProvider value={activeMeeting}>
      <SidebarProvider defaultOpen={false}>
        <SidebarInset className="min-h-svh bg-[#161618]">
          <div className="flex flex-col h-screen">
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
          </div>
        </SidebarInset>
        <JoinRequestsSidebar />
      </SidebarProvider>
    </RealtimeKitProvider>
  )
}
