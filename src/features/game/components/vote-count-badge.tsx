import { Vote } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'

interface VoteCountBadgeProps {
  userId: number | null
}

export function VoteCountBadge({ userId }: VoteCountBadgeProps) {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const currentVotes = useGameStore((s) => s.currentVotes)

  if (!gameStarted || userId == null) return null

  const count = Array.from(currentVotes.values()).filter(
    (id) => id === userId,
  ).length

  if (count === 0) return null

  return (
    <div
      className="absolute bottom-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border"
      style={{
        backgroundColor: 'rgba(237, 184, 58, 0.15)',
        borderColor: 'rgba(237, 184, 58, 0.35)',
        color: 'var(--game-gold)',
      }}
    >
      <Vote className="h-3 w-3" />
      <span>{count}</span>
    </div>
  )
}
