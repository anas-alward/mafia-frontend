import { Shield, Eye, Skull, Crosshair, Stethoscope, User } from 'lucide-react'
import { useGameContext } from '#/features/rooms/context/game-context'

const ROLE_ICONS: Record<string, typeof Shield> = {
  mafia: Skull,
  gunner: Crosshair,
  doctor: Stethoscope,
  cop: Eye,
}

const ROLE_COLORS: Record<string, string> = {
  town: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  mafia: 'bg-red-500/10 text-red-400 border-red-500/20',
  neutral: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

export function GameRoleBadge() {
  const { gameStarted, myRole, myRoleType } = useGameContext()

  if (!gameStarted || !myRole) return null

  const colorClass =
    ROLE_COLORS[myRoleType ?? ''] ?? ROLE_COLORS.neutral
  const Icon = ROLE_ICONS[myRoleType ?? ''] ?? User

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${colorClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{myRole}</span>
    </div>
  )
}
