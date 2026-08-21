interface RoundBadgeProps {
  roundNumber: number
}

export function RoundBadge({ roundNumber }: RoundBadgeProps) {
  return (
    <span
      className="text-xs font-bold font-mono tracking-wider px-2 py-1 rounded-md"
      style={{
        color: 'var(--game-text-primary)',
        backgroundColor: 'var(--game-bg-elevated)',
      }}
    >
      R{roundNumber}
    </span>
  )
}
