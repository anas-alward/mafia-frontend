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

/**
 * Required-action indicator living in the bottom control bar. Collapses
 * to a compact icon with a pending count; hovering (or keyboard-focusing)
 * opens a popup above the bar listing everyone who still owes an action.
 */
export function PhaseEventsPanel() {
  const phase = useGameStore((s) => s.phase)
  const roundNumber = useGameStore((s) => s.roundNumber)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const currentVotes = useGameStore((s) => s.currentVotes)
  const roundRequirements = useGameStore((s) => s.roundRequirements)
  const logs = useGameStore((s) => s.logs)
  const gamePlayers = useGameStore((s) => s.players)
  const deadPlayerIds = useGameStore((s) => s.deadPlayerIds)
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

  // Nothing pending — hide the trigger entirely.
  if (pending.length === 0) return null

  return (
    <div className="group relative flex items-center">
      {/* Divider separating this section from the graveyard strip on its
          left — only shown when the strip is actually rendered */}
      {deadPlayerIds.length > 0 && (
        <span
          aria-hidden
          className="w-px self-stretch my-1.5 mr-1.5"
          style={{ backgroundColor: 'var(--game-border)' }}
        />
      )}

      {/* Trigger — compact, styled like the other control-bar buttons */}
      <button
        type="button"
        className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer border text-xs font-semibold"
        style={{
          color: 'var(--game-text-muted)',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        }}
        aria-label={`${pending.length} required action${pending.length === 1 ? '' : 's'}`}
      >
        <ListTodo className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Actions</span>
        <span
          className="absolute -top-1.5 -right-1.5 text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none px-1"
          style={{
            color: '#1b1922',
            backgroundColor: 'var(--game-gold)',
          }}
        >
          {pending.length}
        </span>
      </button>

      {/* Popup — opens upward from the bar. The bottom padding keeps the
          hover bridge intact so moving from trigger to card doesn't
          dismiss it. Also revealed on keyboard focus-within. */}
      <div className="absolute bottom-full left-0 z-50 pb-2.5 opacity-0 invisible translate-y-1 transition-all duration-200 ease-out group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0">
        <div className="w-60 max-h-[40vh] overflow-y-auto rounded-2xl bg-[#1c1c1f]/95 border border-white/[0.06] shadow-2xl p-2.5">
          <div className="flex items-center gap-2 px-1 pt-1 pb-2">
            <ListTodo className="h-3.5 w-3.5 text-[#71717a] shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a] truncate">
              {phaseHeading(roundNumber, PHASE_LABELS[phase] ?? phase)}
            </span>
          </div>

          <ul className="space-y-1">
            {pending.map((event) => {
              const def = getActionDefinition(event.actionType)
              const Icon = def?.eventIcon
              return (
                <li
                  key={event.key}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1"
                  style={{ backgroundColor: 'rgba(243, 240, 232, 0.04)' }}
                >
                  {Icon && (
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: def.color }}
                    />
                  )}
                  <span
                    className="text-[12px] whitespace-nowrap truncate"
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
                      className="ml-auto text-[9px] font-semibold uppercase px-1 py-px rounded-full shrink-0 whitespace-nowrap"
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
      </div>
    </div>
  )
}