import { useState, useCallback, useMemo, lazy, Suspense } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { ArrowLeft, Copy, Check, Wifi, WifiOff } from 'lucide-react'
import { getRoom } from '#/features/rooms/api/client'
import { mapRoomDto } from '#/features/rooms/types'
import {
  useRoomWebSocket,
  type RoomStateEvent,
} from '#/features/rooms/hooks/use-room-websocket'

const MeetingRoom = lazy(() =>
  import('#/features/rooms/components/meeting-room').then((m) => ({ default: m.MeetingRoom })),
)

export const Route = createFileRoute('/_authenticated/rooms/$roomId')({
  component: MeetingRoomPage,
})

function MeetingRoomPage() {
  const { roomId } = Route.useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const { state: wsState, lastMessage } = useRoomWebSocket(roomId)

  const roomState = useMemo(() => {
    if (lastMessage && lastMessage.type === 'room_state') {
      return lastMessage as RoomStateEvent
    }
    return null
  }, [lastMessage])

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ['rooms', roomId],
    queryFn: async () => {
      const result = await getRoom(roomId)
      return mapRoomDto(result.room)
    },
  })

  const handleCopy = useCallback(() => {
    const url = `${window.location.origin}/rooms/${roomId}`
    navigator.clipboard.writeText(url).catch(() => {
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [roomId])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !room) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-neutral-500">Room not found. It may have been deleted.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate({ to: '/rooms' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    )
  }

  // Show the meeting room when credentials are available
  if (roomState) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-neutral-500">Loading meeting room...</p>
        </div>
      }>
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-6">
          <MeetingRoom
            roomName={room.name}
            roomState={roomState}
          />
          {/* Bar below controls for room info / copy link */}
          <div className="flex items-center justify-between px-4 py-2 bg-white border-t text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            {wsState === 'open' ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-neutral-400" />
            )}
            <span>Code: {room.code}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs h-7">
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy link
              </>
            )}
          </Button>
        </div>
      </div>
      </Suspense>
    )
  }

  // Waiting for WebSocket credentials — show transitional state
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" className="-ml-3" onClick={() => navigate({ to: '/rooms' })}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex items-center gap-2 text-neutral-500">
          {wsState === 'open' ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-neutral-400" />
          )}
          <span>
            {wsState === 'connecting'
              ? 'Connecting...'
              : wsState === 'open'
                ? 'Waiting for room credentials...'
                : wsState === 'error'
                  ? 'Connection error — retrying...'
                  : 'Disconnected'}
          </span>
        </div>
        <p className="text-sm text-neutral-400">{room.name} — code: {room.code}</p>

        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Meeting Link
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
