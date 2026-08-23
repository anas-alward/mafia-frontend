import { Skull } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'

export function PlayerCount() {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const deadPlayerIds = useGameStore((s) => s.deadPlayerIds)

  if (!gameStarted) return null

  const aliveCount = alivePlayerIds.length
  const deadCount = deadPlayerIds.length

  return (
    <div className="flex items-center gap-5 text-xs font-semibold">
      <div
        className="flex items-center gap-2"
        style={{ color: 'var(--game-mint)' }}
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: 'var(--game-mint)',
            boxShadow: '0 0 6px var(--game-mint)',
          }}
        />
        <span>{aliveCount} alive</span>
      </div>
      {deadCount > 0 && (
        <div
          className="flex items-center gap-1.5"
          style={{ color: 'var(--game-crimson)' }}
        >
          <Skull className="h-3.5 w-3.5" />
          <span>{deadCount} dead</span>
        </div>
      )}
    </div>
  )
}
