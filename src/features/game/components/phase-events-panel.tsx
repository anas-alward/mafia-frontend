import { ListTodo } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { getActionDefinition } from '#/features/game/constants/actions'
import {
  derivePhaseEvents,
  phaseHeading,
} from '#/features/game/phase-events'

const PHASE_LABELS: Record<string, string> = {
  day: 'Day',
  night: 'Night',
  vote_result: 'Vote Result',
  ended: 'Ended',
  lobby: 'Lobby',
}

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

  // Nothing pending — hide the rail entirely.
  if (pending.length === 0) return null

  // Collapsed rail: icons only. Hovering the rail expands it to reveal
  // names; moving away collapses it back.
  return (
    <div className="group w-9 hover:w-24 max-h-[70vh] overflow-x-hidden overflow-y-auto rounded-r-2xl bg-[#1c1c1f]/95 border border-l-0 border-white/[0.06] shadow-2xl transition-[width] duration-200 ease-out">
      <div className="flex items-center gap-2 px-2.5 pt-2 pb-1.5">
        <ListTodo className="h-3.5 w-3.5 text-[#71717a] shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {phaseHeading(roundNumber, PHASE_LABELS[phase] ?? phase)}
        </span>
      </div>

      <ul className="space-y-1 px-1.5 pb-2">
        {pending.map((event) => {
          const def = getActionDefinition(event.actionType)
          const Icon = def?.eventIcon
          return (
            <li
              key={event.key}
              className="flex items-center gap-2 rounded-lg px-1 py-1"
              style={{ backgroundColor: 'rgba(243, 240, 232, 0.04)' }}
            >
              {Icon && (
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: def.color }}
                />
              )}
              <span
                className="text-[12px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate"
                style={{
                  color: event.isMine
                    ? 'var(--game-text-primary)'
                    : 'var(--game-text-muted)',
                }}
              >
                {event.actorName ?? (def?.label ?? event.actionType)}
              </span>
              {event.isMine && (
                <span
                  className="ml-auto text-[9px] font-semibold uppercase px-1 py-px rounded-full shrink-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    color: 'var(--game-gold)',
                    backgroundColor: 'rgba(237, 184, 58, 0.1)',
                  }}
                >
                  You
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
