import { lazy, Suspense } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { ArrowLeft, Loader2, AlertTriangle, Video, Wifi } from 'lucide-react'
import { useRoomWebSocket } from '#/features/rooms/hooks/use-room-websocket'
import { useRoomState } from '#/features/rooms/hooks/use-room-state'

const MeetingRoom = lazy(() =>
  import('#/features/rooms/components/meeting-room').then((m) => ({
    default: m.MeetingRoom,
  })),
)

export const Route = createFileRoute('/_authenticated/rooms/$roomId')({
  component: MeetingRoomPage,
})

function MeetingRoomPage() {
  const { roomId } = Route.useParams()
  const navigate = useNavigate()

  const { state: wsState, lastMessage, reconnect, acceptJoinRequest, rejectJoinRequest } = useRoomWebSocket(roomId)
  const { roomState, roomClosed, joinRequests, dismissJoinRequest } = useRoomState(lastMessage)

  // ── Room closed by host ──
  if (roomClosed) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] -m-6 bg-neutral-950">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-10 py-10 text-center space-y-5 max-w-sm w-full shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
            <Video className="h-7 w-7 text-amber-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-neutral-100">Meeting ended by host</h2>
            <p className="text-sm text-neutral-400">Redirecting to rooms page...</p>
          </div>
          <Button
            variant="outline"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
            onClick={() => navigate({ to: '/' })}
          >
            Back to rooms
          </Button>
        </div>
      </div>
    )
  }

  // ── In-call: credentials received, meeting active ──
  if (roomState) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full bg-neutral-950">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        }
      >
        <div className="flex flex-col h-screen -m-6 bg-neutral-950">
          <MeetingRoom
            roomState={roomState}
            joinRequests={joinRequests}
            onAcceptJoinRequest={(userId) => {
              dismissJoinRequest(userId)
              acceptJoinRequest(userId)
            }}
            onRejectJoinRequest={(userId) => {
              dismissJoinRequest(userId)
              rejectJoinRequest(userId)
            }}
          />
        </div>
      </Suspense>
    )
  }

  // ── Pre-call: connecting ──
  if (wsState === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] -m-6 bg-neutral-950">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          onClick={() => navigate({ to: '/rooms' })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-10 py-10 text-center space-y-5 max-w-sm w-full shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
            <Video className="h-7 w-7 text-blue-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-neutral-100">Joning meeting...</h2>
            <p className="text-sm text-neutral-400">Code: {roomId}</p>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-neutral-500 mx-auto" />
        </div>
      </div>
    )
  }

  // ── Pre-call: error ──
  if (wsState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] -m-6 bg-neutral-950">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-10 py-10 text-center space-y-5 max-w-sm w-full shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-neutral-100">Connection error</h2>
            <p className="text-sm text-neutral-400">Could not connect to the meeting server.</p>
          </div>
          <Button
            onClick={reconnect}
            variant="outline"
            className="gap-2 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
          >
            <Wifi className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // ── Pre-call: ws open, waiting for room_state ──
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] -m-6 bg-neutral-950">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
        onClick={() => navigate({ to: '/' })}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-10 py-10 text-center space-y-5 max-w-sm w-full shadow-2xl">
        <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
          <Video className="h-7 w-7 text-blue-400" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-neutral-100">Joining meeting...</h2>
          <p className="text-sm text-neutral-400">Code: {roomId}</p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-neutral-500 mx-auto" />
      </div>
    </div>
  )
}
