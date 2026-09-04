import { useRef, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  RoomContext,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'
import { RoomEvent } from 'livekit-client'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useGameStore } from '#/features/game/store/game-store'

import TilesGrid from '#/features/rooms/components/live/tiles-grid'
import ControlBar from '#/features/rooms/components/live/control-bar'
import LiveParticipantTile from '#/features/rooms/components/live/participant-tile'
import { TileEventOverlay } from '#/features/game/components/tile-event-overlay'
import { GameOverOverlay } from '#/features/game/components/game-over-overlay'
import { TileActionOverlay } from '#/features/rooms/components/live/tile-action-overlay'
import { GameHUD } from '#/features/rooms/components/live/game-hud'
import { LiveSidebar } from '#/features/rooms/components/live/live-sidebar'

export const Route = createFileRoute('/rooms/$roomId/live')({
  component: LiveRoute,
})

function LiveRoute() {
  const { roomId } = Route.useParams()
  const room = useMeetingStore((s) => s.room)

  const navigate = useNavigate()
  const fullScreenRef = useRef<HTMLDivElement>(null)

  // Guard: redirect to /join if no media connection (e.g. direct link to /live)
  useEffect(() => {
    if (!room) {
      navigate({ to: '/rooms/$roomId/join', params: { roomId }, replace: true })
    }
  }, [room, navigate, roomId])

  // Navigate to the ended screen whenever the connection drops (leave,
  // server-side disconnect). Skipped during unmount teardown below.
  useEffect(() => {
    if (!room) return
    const onDisconnected = () => {
      // Cancel any pending auto-reconnect (e.g. after a server-side kick,
      // the SDK would otherwise fight a duplicate identity forever).
      room.disconnect()
      navigate({
        to: '/rooms/$roomId/ended',
        params: { roomId },
        replace: true,
      })
    }
    room.on(RoomEvent.Disconnected, onDisconnected)
    // NOTE: no disconnect on unmount here — TanStack Router can unmount and
    // remount this route during transitions (lazy component suspension), and
    // killing the session would end a healthy call. Teardown lives in the
    // layout route instead.
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected)
    }
  }, [room, navigate, roomId])

  if (!room) {
    return null
  }

  return (
    <RoomContext.Provider value={room}>
      <LiveSidebar>
        <div className="flex flex-col h-screen">
          <div
            ref={fullScreenRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: '100%',
              margin: 0,
            }}
          >
            <LiveRoom fullScreenRef={fullScreenRef} />
          </div>
        </div>
        <LiveSidebar.Panel />
      </LiveSidebar>
      <RoomAudioRenderer />
    </RoomContext.Provider>
  )
}

function LiveRoom({
  fullScreenRef,
}: {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
}) {
  const isHost = useMeetingStore((s) => s.isHost)
  const gameStarted = useGameStore((s) => s.gameStarted)
  const startGame = useGameStore((s) => s.startGame)

  const room = useRoomContext()
  const selfParticipant = room.localParticipant
  const isPreGameHost = isHost && !gameStarted
  const selfUserId = selfParticipant.identity
    ? Number(selfParticipant.identity)
    : null

  return (
    <div
      className="relative flex flex-col h-full w-full"
      style={{ backgroundColor: 'var(--game-bg-deep)' }}
    >
      <div className="game-vignette" />
      <GameHUD />

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div style={{ position: 'absolute', inset: 0 }}>
          <TilesGrid />
        </div>

        <div className="absolute bottom-4 right-4 z-30 w-60 h-36 rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/[0.08]">
          <TileEventOverlay userId={selfUserId}>
            <TileActionOverlay participant={selfParticipant}>
              <LiveParticipantTile
                participant={selfParticipant}
                isSelected={false}
                isSelectable={false}
                onSelect={() => {}}
              />
            </TileActionOverlay>
          </TileEventOverlay>
        </div>
      </div>

      <ControlBar
        fullScreenRef={fullScreenRef}
        isPreGameHost={isPreGameHost}
        onStartGame={startGame}
      />

      <GameOverOverlay />
    </div>
  )
}
