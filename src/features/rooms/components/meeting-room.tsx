import { useEffect } from 'react'
import {
  useRealtimeKitClient,
  useRealtimeKitMeeting,
  RealtimeKitProvider,
} from '@cloudflare/realtimekit-react'
import { RtkMeeting } from '@cloudflare/realtimekit-react-ui'
import type { RoomStateEvent } from '../hooks/use-room-websocket'

interface MeetingRoomProps {
  roomName: string
  roomState: RoomStateEvent | null
}

function MeetingRoomInner() {
  const { meeting } = useRealtimeKitMeeting()

  return (
    <div className="flex flex-col h-full">
      <RtkMeeting mode="fill" meeting={meeting} showSetupScreen={true} />
    </div>
  )
}

export function MeetingRoom(props: MeetingRoomProps) {
  const [meeting, initMeeting] = useRealtimeKitClient()

  useEffect(() => {
    if (!props.roomState?.credentials?.token) return
    if (meeting) return

    initMeeting({ authToken: props.roomState.credentials.token })
  }, [props.roomState?.credentials?.token, meeting, initMeeting])

  if (!props.roomState?.credentials) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-500">Waiting for room credentials...</p>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-500">Connecting to meeting...</p>
      </div>
    )
  }

  return (
    <RealtimeKitProvider value={meeting}>
      <MeetingRoomInner />
    </RealtimeKitProvider>
  )
}
