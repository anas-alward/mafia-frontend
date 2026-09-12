import { Skull } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '#/features/game/store/game-store'

interface PlayerStateProps {
  userId: number | null
}

export function PlayerState({ userId }: PlayerStateProps) {
  const { t } = useTranslation()
  const gameStarted = useGameStore((s) => s.gameStarted)
  const deadPlayerIds = useGameStore((s) => s.deadPlayerIds)

  const isDead = gameStarted && userId != null && deadPlayerIds.includes(userId)
  if (!isDead) return null

  return (
    <div
      className="absolute top-0 end-0 z-30 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded-be-md"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', color: '#fff' }}
    >
      <Skull className="h-3 w-3 text-white" />
      <span className="text-[10px] font-bold tracking-widest uppercase text-white">
        {t('game.playerState.dead', { defaultValue: 'Dead' })}
      </span>
    </div>
  )
}
