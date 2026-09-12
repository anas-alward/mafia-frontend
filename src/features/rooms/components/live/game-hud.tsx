import { useState } from 'react'
import { useParticipants } from '@livekit/components-react'
import { Users, UserPlus, Copy, Check } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useLiveSidebar } from '#/features/rooms/components/live/live-sidebar'
import { PhaseBadge } from '#/features/game/components/phase-badge'
import { RoundBadge } from '#/features/game/components/round-badge'
import { PlayerCount } from '#/features/game/components/player-count'
import { HeaderMenu } from '#/features/rooms/components/live/header-menu'

export function GameHUD({
  fullScreenRef,
}: {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
}) {
  const roomId = useMeetingStore((s) => s.roomId)
  const gameStarted = useGameStore((s) => s.gameStarted)
  const phase = useGameStore((s) => s.phase)
  const roundNumber = useGameStore((s) => s.roundNumber)
  const pendingRequests = useMeetingStore((s) => s.joinRequests)

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

        {/* Right: members, requests, menu */}
        <div className="flex items-center gap-3">
          <MembersToggle count={participantCount} />
          {pendingRequests.length > 0 && (
            <RequestsToggle count={pendingRequests.length} />
          )}
          <HeaderMenu fullScreenRef={fullScreenRef} />
        </div>
      </div>
    </div>
  )
}

/** Joined count — opens the members tab. */
function MembersToggle({ count }: { count: number }) {
  const { activeTab, toggle } = useLiveSidebar()
  const isActive = activeTab === 'members'

  return (
    <button
      type="button"
      onClick={() => toggle('members')}
      className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
      style={{
        color: isActive ? 'var(--game-text-primary)' : 'var(--game-text-muted)',
      }}
      aria-label="Show members"
    >
      <Users className="h-3.5 w-3.5" />
      <span>{count}</span>
    </button>
  )
}

/** Pending join-request count — opens the requests tab. */
function RequestsToggle({ count }: { count: number }) {
  const { toggle } = useLiveSidebar()

  return (
    <button
      type="button"
      onClick={() => toggle('requests')}
      className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
      style={{
        color: 'var(--game-gold)',
      }}
      aria-label="Show join requests"
    >
      <UserPlus className="h-3.5 w-3.5" />
      <span>{count}</span>
    </button>
  )
}
