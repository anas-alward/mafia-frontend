import { useGameStore } from '#/features/game/store/game-store'
import { PhaseEventsPanel } from '#/features/game/components/phase-events-panel'
import {
  ConnectionErrorBanner,
  FullscreenButton,
  GraveyardStrip,
  HostActionsMenu,
  MediaControls,
  StartGameButton,
} from '#/features/rooms/components'

interface ControlBarProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
  isPreGameHost: boolean
  onStartGame: (playerIds: number[]) => void
}

export default function ControlBar({
  fullScreenRef,
  isPreGameHost,
  onStartGame,
}: ControlBarProps) {
  const gameStarted = useGameStore((s) => s.gameStarted)

  return (
    <div className="shrink-0 z-50 flex flex-col">
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
          {!gameStarted && isPreGameHost && (
            <StartGameButton onStartGame={onStartGame} />
          )}

          {/* Graveyard strip — eliminated players (scrollable) */}
          <GraveyardStrip />

          {/* Host actions dropdown (in game) */}
          {gameStarted && <HostActionsMenu />}

          {/* Fullscreen (pre-game) */}
          {!gameStarted && <FullscreenButton fullScreenRef={fullScreenRef} />}
        </div>

        {/* Center: media controls */}
        <MediaControls />

        {/* Right: fullscreen (game) + required actions */}
        <div className="flex items-center gap-1.5">
          {gameStarted && <FullscreenButton fullScreenRef={fullScreenRef} />}
          {gameStarted && <PhaseEventsPanel />}
        </div>
      </div>
    </div>
  )
}
