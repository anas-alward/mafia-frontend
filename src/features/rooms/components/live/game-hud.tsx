import { useState } from 'react'
import { useParticipants } from '@livekit/components-react'
import { Users, Copy, Check } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { LiveSidebar } from '#/features/rooms/components/live/live-sidebar'
import { PhaseBadge } from '#/features/game/components/phase-badge'
import { RoundBadge } from '#/features/game/components/round-badge'
import { PlayerCount } from '#/features/game/components/player-count'

export function GameHUD() {
  const roomId = useMeetingStore((s) => s.roomId)
  const gameStarted = useGameStore((s) => s.gameStarted)
  const phase = useGameStore((s) => s.phase)
  const roundNumber = useGameStore((s) => s.roundNumber)

  const participantCount = useParticipants().length

  const [copied, setCopied] = useState(false)
  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="shrink-0 z-50">
      <div
        className="flex items-center justify-between h-11 px-4"
        style={{
          backgroundColor: 'var(--game-bg-deep)',
        }}
      >
        {/* Left: Room code + copy */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyRoomCode}
            className="group flex items-center gap-2 text-xs font-mono tracking-wider cursor-pointer"
            style={{ color: 'var(--game-text-primary)' }}
          >
            #{roomId}
            {copied ? (
              <Check
                className="h-3.5 w-3.5"
                style={{ color: 'var(--game-mint)' }}
              />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {gameStarted && (
            <span
              className="text-xs select-none"
              style={{ color: 'var(--game-text-muted)' }}
            >
              |
            </span>
          )}

          {gameStarted && <PhaseBadge phase={phase} />}

          {gameStarted && roundNumber != null && (
            <>
              <span
                className="text-xs select-none"
                style={{ color: 'var(--game-text-muted)' }}
              >
                |
              </span>
              <RoundBadge roundNumber={roundNumber} />
            </>
          )}
        </div>

        {/* Center: Game stats */}
        <PlayerCount />

        {/* Right: player count + log toggle */}
        <div className="flex items-center gap-3">
          <LiveSidebar.LogToggle />
          <div
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'var(--game-text-primary)' }}
          >
            <Users className="h-3.5 w-3.5" />
            <span>{participantCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
