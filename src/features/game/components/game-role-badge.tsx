import { User } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'
import {
  ROLE_REGISTRY,
  ROLE_ICON_MAP,
  TEAM_COLORS,
} from '#/features/game/constants'

export function GameRoleBadge() {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const myRoleCode = useGameStore((s) => s.myRoleCode)

  if (!gameStarted || !myRoleCode) return null

  const roleDef = ROLE_REGISTRY[myRoleCode]
  if (!roleDef) return null

  const team = roleDef.role_type
  const colorClass = TEAM_COLORS[team]
  const Icon = ROLE_ICON_MAP[roleDef.icon] ?? User

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${colorClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{roleDef.name}</span>
    </div>
  )
}
