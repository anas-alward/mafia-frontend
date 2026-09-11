import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useGameStore } from '#/features/game/store/game-store'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { getActionDefinition, ActionType } from '#/features/game/constants/actions'
import type { ActionDefinition } from '#/features/game/constants/actions'

interface TileActionOverlayProps {
  participant: any
  /** Hide the action orbs (e.g. while the event animation plays). */
  hideActions?: boolean
  children: ReactNode
}

export function TileActionOverlay({
  participant,
  hideActions,
  children,
}: TileActionOverlayProps) {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const requiredActions = useGameStore((s) => s.requiredActions)
  const castVote = useGameStore((s) => s.castVote)
  const killPlayer = useGameStore((s) => s.killPlayer)
  const healPlayer = useGameStore((s) => s.healPlayer)
  const detectPlayer = useGameStore((s) => s.detectPlayer)
  const shootPlayer = useGameStore((s) => s.shootPlayer)
  const revengeKill = useGameStore((s) => s.revengeKill)
  const silencePlayer = useGameStore((s) => s.silencePlayer)

  const currentUser = useAuthStore((s) => s.user)

  const tileUserId: number | null = participant.identity
    ? Number(participant.identity)
    : null
  const currentUserId = currentUser ? Number(currentUser.id) : null
  const isLocal =
    tileUserId != null &&
    currentUser != null &&
    tileUserId === currentUserId

  const tileActions = useMemo(() => {
    // Server-authoritative: required_actions is empty for players who may
    // not act (including dead ones) — except dying-revenge entitlements,
    // which arrive for dead players too. Alive checks are intentionally
    // not applied here.
    if (!gameStarted || isLocal) {
      return []
    }
    const result: { actionType: string; definition: ActionDefinition }[] = []
    if (tileUserId == null) return result
    for (const a of requiredActions) {
      if (!a.target_options.includes(tileUserId)) continue
      const definition = getActionDefinition(a.action_type)
      if (definition) result.push({ actionType: a.action_type, definition })
    }
    return result
  }, [gameStarted, isLocal, tileUserId, requiredActions])

  const handleTileAction = (actionType: string) => {
    if (tileUserId == null) return
    switch (actionType) {
      case ActionType.VOTE:
        castVote(tileUserId)
        break
      case ActionType.KILL:
        killPlayer(tileUserId)
        break
      case ActionType.HEAL:
        healPlayer(tileUserId)
        break
      case ActionType.DETECT:
        detectPlayer(tileUserId)
        break
      case ActionType.SHOOT:
        shootPlayer(tileUserId)
        break
      case ActionType.REVENGE:
        revengeKill(tileUserId)
        break
      case ActionType.SILENCE:
        silencePlayer(tileUserId)
        break
    }
  }

  return (
    <div className="group relative h-full w-full rounded-lg">
      {children}

      {tileActions.length > 0 && !hideActions && (
        <div className="absolute inset-0 z-25 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg overflow-hidden">
          {tileActions.map(({ actionType, definition }) => (
            <button
              key={actionType}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleTileAction(actionType)
              }}
              title={definition.label}
              className="flex-1 h-full flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: definition.color,
              }}
            >
              <definition.Icon
                className="h-6 w-6"
                style={{ color: '#131314' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
