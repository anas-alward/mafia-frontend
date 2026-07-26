import { useState, useEffect, useRef, useCallback } from 'react'
import { Skull, Heart } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'
import { Phase as GamePhaseEnum, PHASE_META } from '#/features/game/constants'
import type { GamePhase } from '#/features/game/events'

const GAMEPHASE_TO_PHASE: Partial<Record<GamePhase, GamePhaseEnum>> = {
  day: GamePhaseEnum.DAY,
  night: GamePhaseEnum.NIGHT,
  vote_result: GamePhaseEnum.VOTE_RESULT,
}

// Animation timing (ms)
const T_ENTER = 700
const T_HOLD = 2500
const T_EXIT = 3200

type AnimPhase = 'entering' | 'holding' | 'exiting' | 'idle'

interface NightEvent {
  type: 'kill' | 'heal' | 'died'
  targetCode: string
  actorCode: string
}

interface TransitionSnapshot {
  nightEvents: NightEvent[]
  lynchTargetCode: string | null
}

function getPlayerCode(id: number): string {
  const players = useGameStore.getState().players
  const player = players.find((p) => p.id === id)
  return player?.code ?? `Player ${id}`
}

export function PhaseTransition() {
  const phase = useGameStore((s) => s.phase)
  const prevPhaseRef = useRef<GamePhase>(phase)
  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle')
  const [displayPhase, setDisplayPhase] = useState<GamePhase | null>(null)
  const [snapshot, setSnapshot] = useState<TransitionSnapshot | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const trigger = useCallback((newPhase: GamePhase) => {
    if (newPhase === 'lobby' || newPhase === 'ended') return
    const prev = prevPhaseRef.current
    prevPhaseRef.current = newPhase
    if (prev === newPhase) return

    for (const t of timersRef.current) clearTimeout(t)
    timersRef.current = []

    const store = useGameStore.getState()
    const snap: TransitionSnapshot = { nightEvents: [], lynchTargetCode: null }

    if (newPhase === 'day') {
      // Collect night events from recent logs
      const recent = store.logs.slice(-12)
      for (const log of recent) {
        if (log.action_type === 'kill' || log.action_type === 'died') {
          snap.nightEvents.push({
            type: log.action_type as 'kill' | 'died',
            targetCode: getPlayerCode(log.target_id),
            actorCode: getPlayerCode(log.actor_id),
          })
        } else if (log.action_type === 'heal') {
          snap.nightEvents.push({
            type: 'heal',
            targetCode: getPlayerCode(log.target_id),
            actorCode: getPlayerCode(log.actor_id),
          })
        }
      }
      // Deduplicate: last event per target wins
      const seen = new Map<string, NightEvent>()
      for (const evt of snap.nightEvents) {
        seen.set(`${evt.type}:${evt.targetCode}`, evt)
      }
      snap.nightEvents = Array.from(seen.values())
    }

    if (newPhase === 'vote_result') {
      const targetId = store.lynchTargetId
      if (targetId != null) {
        snap.lynchTargetCode = getPlayerCode(targetId)
      }
    }

    setSnapshot(snap)
    setDisplayPhase(newPhase)
    setAnimPhase('entering')

    timersRef.current.push(setTimeout(() => setAnimPhase('holding'), T_ENTER))
    timersRef.current.push(setTimeout(() => setAnimPhase('exiting'), T_HOLD))
    timersRef.current.push(
      setTimeout(() => {
        setAnimPhase('idle')
        setDisplayPhase(null)
        setSnapshot(null)
      }, T_EXIT),
    )
  }, [])

  useEffect(() => {
    trigger(phase)
  }, [phase, trigger])

  useEffect(() => {
    return () => {
      for (const t of timersRef.current) clearTimeout(t)
    }
  }, [])

  if (animPhase === 'idle' || !displayPhase) return null

  const phaseEnum = GAMEPHASE_TO_PHASE[displayPhase]
  if (!phaseEnum) return null
  const meta = PHASE_META[phaseEnum]

  const { label, Icon, color, glow } = meta
  const isHolding = animPhase === 'holding'

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ perspective: '1200px' }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 transition-opacity duration-300 ${
          animPhase === 'exiting' ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Top curtain panel */}
      <div
        className="absolute left-0 right-0 top-0 bg-[#0c0c0e] border-b border-white/[0.04]"
        style={{
          height: '50%',
          transform:
            animPhase === 'entering' || animPhase === 'holding'
              ? 'translateY(-100%)'
              : 'translateY(0)',
          transition:
            animPhase === 'exiting'
              ? 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)'
              : 'transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          boxShadow:
            animPhase === 'entering' || animPhase === 'holding'
              ? `0 8px 40px ${glow}`
              : 'none',
          transitionProperty: 'transform, box-shadow',
        }}
      />

      {/* Bottom curtain panel */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-[#0c0c0e] border-t border-white/[0.04]"
        style={{
          height: '50%',
          transform:
            animPhase === 'entering' || animPhase === 'holding'
              ? 'translateY(100%)'
              : 'translateY(0)',
          transition:
            animPhase === 'exiting'
              ? 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)'
              : 'transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          boxShadow:
            animPhase === 'entering' || animPhase === 'holding'
              ? `0 -8px 40px ${glow}`
              : 'none',
          transitionProperty: 'transform, box-shadow',
        }}
      />

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        style={{
          opacity: isHolding ? 1 : animPhase === 'entering' ? 0.6 : 0,
          transition: 'opacity 350ms ease-out',
        }}
      >
        {/* Icon ring */}
        <div
          className="relative flex items-center justify-center w-20 h-20 rounded-full"
          style={{
            transform: isHolding
              ? 'scale(1) rotate(0deg)'
              : animPhase === 'exiting'
                ? 'scale(1.1)'
                : 'scale(0.3) rotate(-15deg)',
            transition:
              animPhase === 'exiting'
                ? 'transform 300ms ease-in'
                : 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: `0 0 60px ${glow}, inset 0 0 30px ${glow}`,
            background: `radial-gradient(circle, ${glow}, transparent 70%)`,
          }}
        >
          <Icon
            className={`h-9 w-9 ${color}`}
            style={{ filter: `drop-shadow(0 0 12px ${glow})` }}
          />
        </div>

        {/* Label */}
        <span
          className={`text-2xl font-bold tracking-wide ${color}`}
          style={{
            opacity: isHolding ? 1 : animPhase === 'entering' ? 0 : 1,
            transform: isHolding
              ? 'translateY(0)'
              : animPhase === 'entering'
                ? 'translateY(12px)'
                : 'translateY(0)',
            transition:
              animPhase === 'entering'
                ? 'opacity 250ms ease-out, transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                : 'opacity 150ms ease-in, transform 150ms ease-in',
            textShadow: `0 0 40px ${glow}`,
          }}
        >
          {label}
        </span>

        {/* ── Event details (breaking news) ── */}
        {isHolding && snapshot && (
          <div
            className="flex flex-col items-center gap-2 mt-2 rise-in"
            style={{ animationDelay: '200ms' }}
          >
            {/* Separator */}
            <div
              className="w-32 h-px rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }}
            />

            {/* Day: night results */}
            {displayPhase === 'day' && (
              <div className="flex flex-col items-center gap-1.5">
                {snapshot.nightEvents.length === 0 ? (
                  <p className="text-sm text-[#a1a1aa] tracking-wide">
                    Everyone survived the night
                  </p>
                ) : (
                  snapshot.nightEvents.map((evt, i) => (
                    <p
                      key={i}
                      className="text-sm font-medium tracking-wide flex items-center gap-1.5"
                      style={{ color: evt.type === 'heal' ? '#a3e635' : '#f87171' }}
                    >
                      {evt.type === 'heal' ? (
                        <Heart className="h-3.5 w-3.5" />
                      ) : (
                        <Skull className="h-3.5 w-3.5" />
                      )}
                      {evt.type === 'heal'
                        ? `${evt.targetCode} was saved`
                        : `${evt.targetCode} was killed`}
                    </span>
                  ))
                )}
              </div>
            )}

            {/* Vote result: lynch target */}
            {displayPhase === 'vote_result' && snapshot.lynchTargetCode && (
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-medium text-[#f87171] tracking-wide flex items-center gap-1.5">
                  <Skull className="h-3.5 w-3.5" />
                  {snapshot.lynchTargetCode} was eliminated
                </p>
              </div>
            )}

            {/* Night: no extra info — just the transition */}
          </div>
        )}
      </div>
    </div>
  )
}
