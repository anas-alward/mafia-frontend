import { describe, expect, it } from 'vitest'
import { derivePhaseEvents } from './phase-events'
import type { GameLogEntry, GameStatePlayer } from './events'

const gamePlayers: GameStatePlayer[] = [
  { id: 1, code: 'a', status: 'alive', name: 'Anas' },
  { id: 2, code: 'b', status: 'alive', name: 'Sara' },
  { id: 3, code: 'c', status: 'alive', name: 'Omar' },
]

const base = {
  roundNumber: 2,
  alivePlayerIds: [1, 2, 3],
  currentVotes: new Map<number, number>(),
  roundRequirements: [],
  logs: [] as GameLogEntry[],
  myUserId: 1,
  gamePlayers,
  participants: [],
}

describe('derivePhaseEvents — day requirements', () => {
  it('lists a named pending vote per alive player', () => {
    const { requirements } = derivePhaseEvents({ ...base, phase: 'day' })
    expect(requirements).toHaveLength(3)
    expect(requirements[0]).toMatchObject({
      actionType: 'vote',
      actorName: 'Anas',
      done: false,
      isMine: true,
      text: 'Anas needs to vote',
    })
  })

  it('marks votes as done with strikethrough-worthy done flag', () => {
    const { requirements } = derivePhaseEvents({
      ...base,
      phase: 'day',
      currentVotes: new Map([[2, 1]]),
    })
    const sara = requirements.find((r) => r.actorName === 'Sara')
    expect(sara?.done).toBe(true)
    expect(sara?.text).toBe('Sara voted')
  })
})

describe('derivePhaseEvents — night requirements', () => {
  it('lists anonymous per-action-type rows, done/pending, no names', () => {
    const { requirements } = derivePhaseEvents({
      ...base,
      phase: 'night',
      roundRequirements: [
        { action_type: 'kill', done: false },
        { action_type: 'heal', done: true },
      ],
    })
    expect(requirements).toHaveLength(2)
    expect(requirements[0]).toMatchObject({
      actionType: 'kill',
      actorName: null,
      isMine: false,
      done: false,
      text: 'Kill',
    })
    expect(requirements[1]).toMatchObject({
      actionType: 'heal',
      actorName: null,
      done: true,
      text: 'Heal',
    })
  })
})

describe('derivePhaseEvents — log events', () => {
  it('renders vote logs as named events', () => {
    const { events } = derivePhaseEvents({
      ...base,
      phase: 'day',
      logs: [{ actor_id: 2, target_id: 3, action_type: 'vote' }],
    })
    expect(events[0]).toMatchObject({
      actorName: 'Sara',
      targetName: 'Omar',
      done: true,
      text: 'Sara voted for Omar',
    })
  })

  it('renders kill logs WITHOUT actor as anonymous events', () => {
    const { events } = derivePhaseEvents({
      ...base,
      phase: 'day',
      logs: [{ target_id: 3, action_type: 'kill' }],
    })
    expect(events[0]).toMatchObject({
      actorName: null,
      targetName: 'Omar',
      text: 'Omar — Eliminated',
    })
  })

  it('renders healed kills as anonymous save events', () => {
    const { events } = derivePhaseEvents({
      ...base,
      phase: 'day',
      logs: [{ target_id: 3, action_type: 'kill', result: 'healed' }],
    })
    expect(events[0]).toMatchObject({
      actionType: 'heal',
      actorName: null,
      text: 'Omar — Healed',
    })
  })

  it('maps lynch logs so actor_id (the victim) becomes the target', () => {
    const { events } = derivePhaseEvents({
      ...base,
      phase: 'vote_result',
      logs: [{ actor_id: 2, target_id: null, action_type: 'lynch' }],
    })
    expect(events[0]).toMatchObject({
      actorName: null,
      targetName: 'Sara',
      text: 'Sara was lynched',
    })
  })

  it('renders revenge logs as named events', () => {
    const { events } = derivePhaseEvents({
      ...base,
      phase: 'vote_result',
      logs: [{ actor_id: 2, target_id: 1, action_type: 'revenge' }],
    })
    expect(events[0]).toMatchObject({
      actorName: 'Sara',
      targetName: 'Anas',
      isMine: false,
      text: 'Sara took revenge on Anas',
    })
  })
})
