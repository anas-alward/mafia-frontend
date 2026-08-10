import { useRef, useEffect, useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  RealtimeKitProvider,
  useRealtimeKitMeeting,
  useRealtimeKitSelector,
} from '@cloudflare/realtimekit-react'
import {
  RtkUiProvider,
  RtkParticipantsAudio,
  RtkDialogManager,
  RtkNotifications,
  RtkStage,
} from '@cloudflare/realtimekit-react-ui'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useGameStore } from '#/features/game/store/game-store'

import TilesGrid from '#/features/rooms/components/live/tiles-grid'
import ControlBar from '#/features/rooms/components/live/control-bar'
import LiveParticipantTile from '#/features/rooms/components/live/participant-tile'
import { GameHUD } from '#/features/rooms/components/live/game-hud'
import { LiveSidebar } from '#/features/rooms/components/live/live-sidebar'
import { PhaseTransition } from '#/features/game/components/phase-transition'

export const Route = createFileRoute('/rooms/$roomId/live')({
  component: LiveRoute,
})

function LiveRoute() {
  const { roomId } = Route.useParams()
  const meeting = useMeetingStore((s) => s.meeting)
  const meetingInstance = useMeetingStore((s) => s.meetingInstance)

  const navigate = useNavigate()
  const fullScreenRef = useRef<HTMLDivElement>(null)
  const activeMeeting = meetingInstance || meeting

  const mediaDisabled = import.meta.env.VITE_DISABLE_MEDIA === 'true'

  // Guard: redirect to /join if no meeting initialized (e.g. direct link to /live)
  useEffect(() => {
    if (!activeMeeting) {
      navigate({ to: '/rooms/$roomId/join', params: { roomId }, replace: true })
    }
  }, [activeMeeting, navigate, roomId])

  // When media is disabled via env flag, keep mic/cam off after joining
  useEffect(() => {
    if (!mediaDisabled || !activeMeeting) return
    const t = setTimeout(() => {
      activeMeeting.self.disableAudio()
      activeMeeting.self.disableVideo()
    }, 500)
    return () => clearTimeout(t)
  }, [mediaDisabled, activeMeeting])

  const handleStatesUpdate = useCallback(
    (event: { detail: { meeting?: string } }) => {
      if (event.detail.meeting === 'ended') {
        navigate({
          to: '/rooms/$roomId/ended',
          params: { roomId },
          replace: true,
        })
      }
    },
    [navigate, roomId],
  )

  if (!activeMeeting) {
    return null
  }

  return (
    <RealtimeKitProvider value={activeMeeting}>
      <LiveSidebar>
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
            <LiveRoom fullScreenRef={fullScreenRef} />
            <RtkParticipantsAudio />
            <RtkDialogManager />
            <RtkNotifications />
          </RtkUiProvider>
        </div>
        <LiveSidebar.Panel />
      </LiveSidebar>
    </RealtimeKitProvider>
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

  const { meeting } = useRealtimeKitMeeting()
  const selfParticipant = useRealtimeKitSelector(() => meeting.self)
  const isPreGameHost = isHost && !gameStarted

  return (
    <div
      className="relative flex flex-col h-full w-full"
      style={{ backgroundColor: 'var(--game-bg-deep)' }}
    >
      <PhaseTransition />
      <div className="game-vignette" />
      <GameHUD />

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <RtkStage style={{ position: 'absolute', inset: 0 }}>
          <TilesGrid />
        </RtkStage>

        <div className="absolute bottom-4 right-4 z-30 w-60 h-36 rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/[0.08]">
          <LiveParticipantTile
            participant={selfParticipant}
            isSelected={false}
            isSelectable={false}
            onSelect={() => {}}
          />
        </div>
      </div>

      <ControlBar
        fullScreenRef={fullScreenRef}
        isPreGameHost={isPreGameHost}
        onStartGame={startGame}
      />
    </div>
  )
}
