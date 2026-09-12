import { useTranslation } from 'react-i18next'

interface RoundBadgeProps {
  roundNumber: number
}

export function RoundBadge({ roundNumber }: RoundBadgeProps) {
  const { t } = useTranslation()
  return (
    <span
      className="text-xs font-bold font-mono tracking-wider px-2 py-1 rounded-md"
      style={{
        color: 'var(--game-text-primary)',
        backgroundColor: 'var(--game-bg-elevated)',
      }}
    >
      {t('game.roundBadge.label', {
        round: roundNumber,
        defaultValue: `R${roundNumber}`,
      })}
    </span>
  )
}
