import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
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

  // Host game buttons (start pre-game, submit/reset/cancel in-game) sit in
  // the center next to the media buttons, split by a divider.
  const showGameButtons =
    (!gameStarted && isPreGameHost) || (gameStarted && isHost)

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
        {/* Left: graveyard strip — eliminated players (scrollable) */}
        <div className="flex items-center gap-1.5">
          <GraveyardStrip />
        </div>

        {/* Center: host game buttons + divider + media controls */}
        <div className="flex items-center gap-1.5">
          {!gameStarted && isPreGameHost && (
            <StartGameButton onStartGame={onStartGame} />
          )}
          {gameStarted && isHost && <HostActionsMenu />}

          {showGameButtons && (
            <span
              aria-hidden
              className="w-px self-stretch my-2.5"
              style={{ backgroundColor: 'var(--game-border)' }}
            />
          )}

          <MediaControls />
        </div>

        {/* Right: empty — balances the bar so media stays centered. */}
        <div className="flex items-center gap-1.5" aria-hidden="true" />
      </div>
    </div>
  )
}
