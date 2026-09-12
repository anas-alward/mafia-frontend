import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  PHASE_META,
  Phase as GamePhaseEnum,
} from '#/features/game/constants/phases'
import type { GamePhase } from '#/features/game/events'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { getActionDefinition } from '#/features/game/constants/actions'
import { derivePhaseEvents } from '#/features/game/phase-events'

const GAMEPHASE_TO_PHASE: Partial<Record<GamePhase, GamePhaseEnum>> = {
  day: GamePhaseEnum.DAY,
  night: GamePhaseEnum.NIGHT,
  vote_result: GamePhaseEnum.VOTE_RESULT,
}

interface PhaseBadgeProps {
  phase: GamePhase
}

interface ActionGroup {
  actionType: string
  names: (string | null)[]
  isMine: boolean
}

/**
 * Split phase badge for the live room header. Left side names the phase;
 * right side carries the pending required actions as compact avatars
 * (same grouping as the old control-bar stack). Hovering an avatar lifts
 * it and shows a tooltip with who still owes the action. No pending
 * actions — the badge renders as the plain phase pill.
 */
export function PhaseBadge({ phase }: PhaseBadgeProps) {
  const { t } = useTranslation()
  const phaseEnum = GAMEPHASE_TO_PHASE[phase]
  const phaseMeta = phaseEnum ? PHASE_META[phaseEnum] : null

  const storePhase = useGameStore((s) => s.phase)
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
    phase: storePhase,
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

  // Group by action type, preserving first-seen order.
  const groups = new Map<string, ActionGroup>()
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

  if (!phaseMeta) return null

  const PhaseIcon = phaseMeta.Icon

  return (
    <motion.div
      key={phase}
      className="flex items-center rounded-lg text-sm font-bold tracking-wide"
      style={{
        color: '#1B1922',
        backgroundColor: phaseMeta.textColor,
        boxShadow: `0 0 16px ${phaseMeta.glow}`,
      }}
      initial={{ scale: 0.85, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <span className="flex items-center gap-2 px-3.5 py-1.5">
        <PhaseIcon className="h-4 w-4" aria-hidden="true" />
        <span>
          {t(`game.phases.${phaseEnum}.label`, {
            defaultValue: phaseMeta.label,
          })}
        </span>
      </span>

      {groups.size > 0 && (
        <>
          <span
            aria-hidden="true"
            className="w-px self-stretch my-1.5"
            style={{ backgroundColor: 'rgba(27, 25, 34, 0.25)' }}
          />
          <span className="flex items-center ps-2 pe-3 py-1">
            {[...groups.values()].map((group, i) => (
              <ActionAvatar
                key={group.actionType}
                group={group}
                index={i}
                hovered={hovered}
                setHovered={setHovered}
              />
            ))}
          </span>
        </>
      )}
    </motion.div>
  )
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
    hovered === null ? 0 : hovered === index ? 0 : index < hovered ? -5 : 5

  const def = getActionDefinition(group.actionType)
  const Icon = def?.eventIcon
  const pendingCount = group.names.length

  const { t } = useTranslation()

  // Constants-driven action label, translated at the render site.
  const actionLabel = t(`game.actions.${group.actionType}.label`, {
    defaultValue: def?.label ?? group.actionType,
  })

  // Solid avatar background: the action's full accent color, with a dark
  // icon for contrast. No transparency — overlaps stay clean.
  const solid = def?.color ?? 'var(--game-bg-elevated)'

  // Tooltip lines: named players for public day votes, a count for the
  // anonymous night requirements.
  const tooltipLines =
    group.names[0] != null
      ? group.names.slice(0, 4)
      : [`${actionLabel} ×${pendingCount}`]

  const ariaLabel = t('game.phaseEvents.pendingActions', {
    count: pendingCount,
    action: actionLabel,
    defaultValue_one: `${pendingCount} required action: ${actionLabel}`,
    defaultValue_other: `${pendingCount} required actions: ${actionLabel}`,
    defaultValue: `${pendingCount} required actions: ${actionLabel}`,
  })

  return (
    <motion.div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      animate={{
        x: spread,
        scale: hovered === index ? 1.08 : 1,
        y: hovered === index ? -2 : 0,
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={`relative ${index === 0 ? '' : '-ms-1'}`}
      style={{ zIndex: hovered === index ? 30 : 20 - index }}
    >
      <div
        className="h-6 w-6 rounded-full flex items-center justify-center select-none transition-shadow duration-200"
        style={{
          backgroundColor: solid,
          boxShadow: isHovered
            ? '0 6px 16px rgba(0,0,0,0.5)'
            : '0 2px 6px rgba(0,0,0,0.4)',
          ...(group.isMine
            ? { outline: '2px solid var(--game-gold)', outlineOffset: '1px' }
            : {}),
        }}
        aria-label={ariaLabel}
      >
        {Icon && <Icon className="h-3 w-3" style={{ color: '#131314' }} />}
      </div>

      {/* Tooltip above the avatar */}
      <AnimatePresence>
        {hovered === index && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
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
