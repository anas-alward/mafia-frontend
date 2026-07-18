import { Sun, Moon, Gavel } from 'lucide-react'
import { useGameContext } from '#/features/rooms/context/game-context'
import type { GamePhase } from '#/features/rooms/events'

const PHASE_META: Record<
  Exclude<GamePhase, 'lobby' | 'ended'>,
  { label: string; Icon: typeof Sun; bg: string; text: string }
> = {
  day: { label: 'Day', Icon: Sun, bg: 'bg-amber-500/10', text: 'text-amber-400' },
  night: {
    label: 'Night',
    Icon: Moon,
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
  },
  vote_result: {
    label: 'Vote Result',
    Icon: Gavel,
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
  },
}

export function GamePhaseIndicator() {
  const { phase } = useGameContext()

  if (phase === 'lobby' || phase === 'ended') return null

  const meta = PHASE_META[phase]
  if (!meta) return null

  const { label, Icon, bg, text } = meta

  return (
    <div
      className={`flex items-center justify-center gap-2 h-8 text-sm font-medium ${bg} ${text}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  )
}
