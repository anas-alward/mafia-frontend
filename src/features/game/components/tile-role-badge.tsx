import { useGameStore } from '#/features/game/store/game-store'
import { ROLE_REGISTRY } from '#/features/game/constants/roles'
import type { RoleDefinition } from '#/features/game/constants/roles'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

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

  const roleDef = ROLE_REGISTRY[roleCode] as RoleDefinition | undefined
  if (!roleDef) return null

  const Icon = roleDef.Icon

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="absolute top-3 left-3 z-30 w-6 h-6 rounded-md flex items-center justify-center border"
            style={{
              backgroundColor: 'rgba(27, 25, 34, 0.75)',
              borderColor: 'var(--game-border)',
              color: 'var(--game-text-primary)',
            }}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">{roleDef.name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
