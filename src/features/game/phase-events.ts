import { getActionDefinition } from './constants/actions'
import type {
  GameLogEntry,
  GamePhase,
  GameStatePlayer,
} from './events'
import { resolveActorName } from './tile-events'

export interface PhaseEvent {
  key: string
  actionType: string
  /** Who must do / did the action — null when the audience must not know. */
  actorName: string | null
  /** Who the action targets, when the event names one. */
  targetName: string | null
  /** True when the obligation or action belongs to the current viewer. */
  isMine: boolean
  /** Pending requirement (false) vs completed event (true). */
  done: boolean
  /** Ready-to-render sentence. */
  text: string
}

export interface PhaseEventsInput {
  phase: GamePhase
  roundNumber: number | null
  alivePlayerIds: number[]
  currentVotes: Map<number, number>
  /** Anonymous per-action-type status sent to every player (no names). */
  roundRequirements: { action_type: string; done: boolean }[]
  logs: GameLogEntry[]
  myUserId: number | null
  gamePlayers: GameStatePlayer[]
  participants: { userId: number; username: string }[]
}

function makeNamer(gamePlayers: GameStatePlayer[], participants: { userId: number; username: string }[]) {
  return (id: number | null | undefined) =>
    id == null ? null : resolveActorName(id, gamePlayers, participants)
}

function labelFor(actionType: string): string {
  return getActionDefinition(actionType)?.label ?? actionType
}

/**
 * Derive the per-phase event lists for the current round.
 *
 * Requirements — what still needs to happen this phase:
 *   DAY: one vote per alive player, NAMED (votes are public).
 *   NIGHT / VOTE_RESULT: the viewer's own obligations, named to them only.
 *
 * Events — what already happened this round, from the round logs:
 *   Named when the log carries actor_id (votes, revenge), anonymous when
 *   the audience must not know who acted (kill, heal, silence). Lynch
 *   logs carry the VICTIM in actor_id per backend convention.
 */
export function derivePhaseEvents(input: PhaseEventsInput): {
  requirements: PhaseEvent[]
  events: PhaseEvent[]
} {
  const {
    phase,
    alivePlayerIds,
    currentVotes,
    roundRequirements = [],
    logs,
    myUserId,
    gamePlayers,
    participants,
  } = input
  const nameOf = (id: number | null | undefined) =>
    makeNamer(gamePlayers, participants)(id) ?? null
  const requirements: PhaseEvent[] = []
  if (phase === 'day') {
    for (const id of alivePlayerIds) {
      const done = currentVotes.has(id)
      const actorName = nameOf(id)
      requirements.push({
        key: `vote-${id}`,
        actionType: 'vote',
        actorName,
        targetName: null,
        isMine: id === myUserId,
        done,
        text: done ? `${actorName} voted` : `${actorName} needs to vote`,
      })
    }
  } else if (phase === 'night' || phase === 'vote_result') {
    // Anonymous phase requirements — every player sees which actions are
    // done/pending, never WHO must act.
    for (const [i, r] of roundRequirements.entries()) {
      requirements.push({
        key: `req-${r.action_type}-${i}`,
        actionType: r.action_type,
        actorName: null,
        targetName: null,
        isMine: false,
        done: r.done,
        text: labelFor(r.action_type),
      })
    }
  }

  const events: PhaseEvent[] = logs.map((log, i) => {
    const actionType = log.result === 'healed' ? 'heal' : log.action_type
    const label = labelFor(actionType)

    if (log.action_type === 'lynch') {
      // Backend convention: actor_id carries the VICTIM of the lynch.
      const victim = nameOf(log.actor_id)
      return {
        key: `ev-${i}-lynch`,
        actionType,
        actorName: null,
        targetName: victim,
        isMine: false,
        done: true,
        text: victim ? `${victim} was lynched` : label,
      }
    }

    if (log.actor_id != null) {
      const actor = nameOf(log.actor_id)
      const target = nameOf(log.target_id)
      const isMine = log.actor_id === myUserId
      if (actionType === 'vote') {
        return {
          key: `ev-${i}-vote`,
          actionType,
          actorName: actor,
          targetName: target,
          isMine,
          done: true,
          text: target ? `${actor} voted for ${target}` : `${actor} voted`,
        }
      }
      if (actionType === 'revenge') {
        return {
          key: `ev-${i}-revenge`,
          actionType,
          actorName: actor,
          targetName: target,
          isMine,
          done: true,
          text: target ? `${actor} took revenge on ${target}` : `${actor} took revenge`,
        }
      }
      return {
        key: `ev-${i}-${actionType}`,
        actionType,
        actorName: actor,
        targetName: target,
        isMine,
        done: true,
        text: target ? `${actor} — ${label} → ${target}` : `${actor} — ${label}`,
      }
    }

    const target = nameOf(log.target_id)
    const message = getActionDefinition(actionType)?.eventMessage ?? label
    return {
      key: `ev-${i}-${actionType}`,
      actionType,
      actorName: null,
      targetName: target,
      isMine: false,
      done: true,
      text: target ? `${target} — ${message}` : message,
    }
  })

  return { requirements, events }
}

export function phaseHeading(
  roundNumber: number | null,
  phaseLabel: string,
): string {
  return `Round ${roundNumber ?? '—'} · ${phaseLabel}`
}
