import { useGameContext } from '#/features/rooms/context/game-context'
import { useRoomContext } from '#/features/rooms/context/room-context'
import { useAuthStore } from '#/features/auth/store/auth-store'

export function GameNightPanel() {
  const { phase, alivePlayerIds, myRoleType, killPlayer, healPlayer, detectPlayer, shootPlayer, silentAction } =
    useGameContext()
  const { participants } = useRoomContext()
  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser ? Number(currentUser.id) : null

  if (phase !== 'night' || !currentUserId || !myRoleType) return null

  const targets = participants.filter(
    (p) => alivePlayerIds.includes(p.userId) && p.userId !== currentUserId,
  )

  const actions: { label: string; handler: (targetId: number) => void }[] = []

  switch (myRoleType) {
    case 'mafia':
      actions.push({ label: 'Kill', handler: killPlayer })
      break
    case 'doctor':
      actions.push({ label: 'Heal', handler: healPlayer })
      break
    case 'cop':
      actions.push({ label: 'Detect', handler: detectPlayer })
      break
    case 'gunner':
      actions.push({ label: 'Shoot', handler: shootPlayer })
      break
    default:
      actions.push({ label: 'Pass', handler: () => silentAction() })
  }

  return (
    <div className="bg-[#212124] border border-white/5 rounded-lg p-4">
      <h3 className="text-sm font-medium text-[#f4f4f5] mb-2">Night actions</h3>
      {actions.map((action) => (
        <div key={action.label} className="space-y-2">
          {action.label === 'Pass' ? (
            <button
              type="button"
              onClick={() => silentAction()}
              className="w-full px-3 py-1.5 rounded-lg text-sm bg-white/5 text-[#d4d4d8] hover:bg-white/10 transition-colors"
            >
              Pass (skip action)
            </button>
          ) : (
            <>
              <p className="text-xs text-[#a1a1aa]">{action.label}:</p>
              <div className="flex flex-wrap gap-2">
                {targets.length === 0 ? (
                  <p className="text-sm text-[#71717a]">No targets available.</p>
                ) : (
                  targets.map((target) => (
                    <button
                      key={target.userId}
                      type="button"
                      onClick={() => action.handler(target.userId)}
                      className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-[#d4d4d8] hover:bg-white/10 transition-colors"
                    >
                      {target.username}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
