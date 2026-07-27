import { User } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'
import { ROLE_REGISTRY, ROLE_ICON_MAP, TEAM_COLORS } from '#/features/game/constants'
import { Team } from '#/features/game/constants'

export function GameRoleBadge() {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const myRole = useGameStore((s) => s.myRole)
  const myRoleCode = useGameStore((s) => s.myRoleCode)
  const myRoleType = useGameStore((s) => s.myRoleType)

  if (!gameStarted || !myRoleCode) return null

  const roleDef = ROLE_REGISTRY[myRoleCode]
  const team = (myRoleType as Team) ?? (roleDef?.role_type)
  const colorClass = TEAM_COLORS[team] ?? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  const Icon = roleDef ? ROLE_ICON_MAP[roleDef.icon] ?? User : User

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${colorClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{myRole}</span>
    </div>
  )
}
