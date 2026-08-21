import { useGameStore } from '#/features/game/store/game-store'
import { ROLE_REGISTRY, ROLE_ICON_MAP } from '#/features/game/constants'

interface TileRoleBadgeProps {
  userId: number | null
  isLocal: boolean
  isMafia: boolean
}

export function TileRoleBadge({ userId, isLocal, isMafia }: TileRoleBadgeProps) {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const myRoleCode = useGameStore((s) => s.myRoleCode)
  const mafiaMemberRoles = useGameStore((s) => s.mafiaMemberRoles)

  if (!gameStarted) return null

  let roleCode: string | undefined
  if (isLocal && myRoleCode) {
    roleCode = myRoleCode
  } else if (isMafia && userId != null) {
    roleCode = mafiaMemberRoles[userId]
  }

  if (!roleCode) return null

  const roleDef = ROLE_REGISTRY[roleCode]
  const Icon = ROLE_ICON_MAP[roleDef.icon]

  return (
    <div
      className="absolute top-3 left-3 z-20 w-6 h-6 rounded-md flex items-center justify-center border"
      style={{
        backgroundColor: 'rgba(27, 25, 34, 0.75)',
        borderColor: 'var(--game-border)',
        color: 'var(--game-text-primary)',
      }}
    >
      <Icon className="h-3.5 w-3.5" />
    </div>
  )
}
