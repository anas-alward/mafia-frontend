import { useParticipants } from '@livekit/components-react'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { PhaseEventsPanel } from '#/features/game/components/phase-events-panel'
import {
  ConnectionErrorBanner,
  GraveyardStrip,
  HostActionsMenu,
  MediaControls,
  StartGameButton,
} from '#/features/rooms/components'

interface ControlBarProps {
  isPreGameHost: boolean
  onStartGame: (playerIds: number[]) => void
}

export default function ControlBar({
  isPreGameHost,
  onStartGame,
}: ControlBarProps) {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const isHost = useMeetingStore((s) => s.isHost)
  const deadPlayerIds = useGameStore((s) => s.deadPlayerIds)
  const playerIds = useGameStore((s) => s.playerIds)
  const lkParticipants = useParticipants()

  // The strip renders dead players and non-player spectators; the divider
  // only makes sense when it actually has content.
  const stripHasContent =
    gameStarted &&
    (deadPlayerIds.length > 0 ||
      lkParticipants.some((p) => !playerIds.includes(Number(p.identity))))

  return (
    // Pinned to LTR in every locale — control bar chrome never mirrors.
    <div dir="ltr" className="shrink-0 z-50 flex flex-col">
      <ConnectionErrorBanner />

      {/* Main bar */}
      <div
        className="flex items-center justify-between h-14 px-5"
        style={{
          backgroundColor: 'var(--game-bg-deep)',
        }}
      >
        {/* Left: game management actions */}
        <div className="flex items-center gap-1.5">
          {/* Host split button — pinned to the far left (in game) */}
          {gameStarted && <HostActionsMenu />}

          {/* Divider between the host split button and the graveyard —
              only when the strip actually renders content */}
          {gameStarted && isHost && stripHasContent && (
            <span
              aria-hidden
              className="w-px self-stretch my-2.5"
              style={{ backgroundColor: 'var(--game-border)' }}
            />
          )}

          {/* Graveyard strip — eliminated players (scrollable) */}
          <GraveyardStrip />

          {/* Fullscreen (pre-game) */}
          {!gameStarted && isPreGameHost && (
            <StartGameButton onStartGame={onStartGame} />
          )}
        </div>

        {/* Center: media controls */}
        <MediaControls />

        {/* Right: required actions */}
        <div className="flex items-center gap-1.5">
          {gameStarted && <PhaseEventsPanel />}
        </div>
      </div>
    </div>
  )
}
