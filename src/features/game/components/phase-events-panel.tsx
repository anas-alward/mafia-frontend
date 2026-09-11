import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { getActionDefinition } from '#/features/game/constants/actions'
import { derivePhaseEvents } from '#/features/game/phase-events'

/**
 * Required-action avatar stack in the control bar's left section. Pending
 * obligations are grouped by action type; each group renders as one
 * circular avatar carrying that action's icon and accent color. Hovering
 * an avatar scales it up and lifts it, neighbours spread apart smoothly,
 * and a tooltip above lists who still owes the action (or the action
 * count for anonymous night requirements). A "+N" avatar groups overflow.
 */
export function PhaseEventsPanel() {
  const phase = useGameStore((s) => s.phase)
  const roundNumber = useGameStore((s) => s.roundNumber)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const currentVotes = useGameStore((s) => s.currentVotes)
  const roundRequirements = useGameStore((s) => s.roundRequirements)
  const logs = useGameStore((s) => s.logs)
  const gamePlayers = useGameStore((s) => s.players)
  const participants = useMeetingStore((s) => s.participants)
  const currentUser = useAuthStore((s) => s.user)
  const myUserId = currentUser ? Number(currentUser.id) : null

  const [hovered, setHovered] = useState<number | null>(null)

  const { requirements } = derivePhaseEvents({
    phase,
    roundNumber,
    alivePlayerIds,
    currentVotes,
    roundRequirements,
    logs,
    myUserId,
    gamePlayers,
    participants,
  })

  // Only items that still require an action — completed ones are dropped.
  const pending = requirements.filter((event) => !event.done)

  // Nothing pending — hide the stack entirely.
  if (pending.length === 0) return null

  // Group by action type, preserving first-seen order. Groups carry the
  // pending actor names (day votes) and whether one of them is mine.
  const groups = new Map<
    string,
    { actionType: string; names: (string | null)[]; isMine: boolean }
  >()
  for (const event of pending) {
    const group = groups.get(event.actionType) ?? {
      actionType: event.actionType,
      names: [],
      isMine: false,
    }
    group.names.push(event.actorName)
    if (event.isMine) group.isMine = true
    groups.set(event.actionType, group)
  }

  return (
    <div className="flex items-center">
      {[...groups.values()].map((group, i) => (
        <ActionAvatar
          key={group.actionType}
          group={group}
          index={i}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  )
}

interface ActionGroup {
  actionType: string
  names: (string | null)[]
  isMine: boolean
}

function ActionAvatar({
  group,
  index,
  hovered,
  setHovered,
}: {
  group: ActionGroup
  index: number
  hovered: number | null
  setHovered: (i: number | null) => void
}) {
  const isHovered = hovered === index
  // Neighbours slide away from the hovered avatar; the hovered one lifts.
  const spread =
    hovered === null
      ? 0
      : hovered === index
        ? 0
        : index < hovered
          ? -5
          : 5

  const def = getActionDefinition(group.actionType)
  const Icon = def?.eventIcon
  const pendingCount = group.names.length

  // Tooltip lines: named players for public day votes, a count for the
  // anonymous night requirements.
  const tooltipLines =
    group.names[0] != null
      ? group.names.slice(0, 4)
      : [`${def?.label ?? group.actionType} ×${pendingCount}`]

  return (
    <motion.div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      animate={{ x: spread, scale: hovered === index ? 1.18 : 1, y: hovered === index ? -3 : 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={`relative ${index === 0 ? '' : '-ml-1.5'}`}
      style={{ zIndex: hovered === index ? 30 : 20 - index }}
    >
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center select-none transition-shadow duration-200"
        style={{
          backgroundColor: def?.bg ?? 'var(--game-bg-elevated)',
          boxShadow: isHovered
            ? `0 0 0 2px ${def?.border ?? 'var(--game-border)'}, 0 6px 16px rgba(0,0,0,0.5)`
            : `0 0 0 1.5px ${def?.border ?? 'var(--game-border)'}, 0 2px 6px rgba(0,0,0,0.4)`,
          ...(group.isMine
            ? { outline: '2px solid var(--game-gold)', outlineOffset: '1px' }
            : {}),
        }}
        aria-label={`${pendingCount} required action${pendingCount === 1 ? '' : 's'}: ${group.actionType}`}
      >
        {Icon && <Icon className="h-4 w-4" style={{ color: def.color }} />}
      </div>

      {/* Tooltip above the avatar */}
      <AnimatePresence>
        {hovered === index && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none whitespace-nowrap rounded-lg bg-[#26262b] border border-white/[0.08] px-2.5 py-1.5 shadow-xl"
          >
            {tooltipLines.map((line) => (
              <div
                key={line}
                className="text-[11px] font-medium leading-relaxed"
                style={{ color: 'var(--game-text-primary)' }}
              >
                {line}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
