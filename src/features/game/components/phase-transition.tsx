import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '#/features/game/store/game-store'
import { Phase as GamePhaseEnum, PHASE_META } from '#/features/game/constants'
import type { GamePhase } from '#/features/game/events'

const GAMEPHASE_TO_PHASE: Partial<Record<GamePhase, GamePhaseEnum>> = {
  day: GamePhaseEnum.DAY,
  night: GamePhaseEnum.NIGHT,
  vote_result: GamePhaseEnum.VOTE_RESULT,
}

type AnimPhase = 'entering' | 'holding' | 'exiting' | 'idle'

export function PhaseTransition() {
  const phase = useGameStore((s) => s.phase)
  const prevPhaseRef = useRef<GamePhase>(phase)
  const [animState, setAnimState] = useState<AnimPhase>('idle')
  const [displayPhase, setDisplayPhase] = useState<GamePhase | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const trigger = useCallback((newPhase: GamePhase) => {
    if (newPhase === 'lobby' || newPhase === 'ended') return
    const prev = prevPhaseRef.current
    prevPhaseRef.current = newPhase
    if (prev === newPhase) return

    // Clear any in-progress animation
    for (const t of timersRef.current) clearTimeout(t)
    timersRef.current = []

    setDisplayPhase(newPhase)
    setAnimState('entering')

    timersRef.current.push(setTimeout(() => setAnimState('holding'), 600))
    timersRef.current.push(setTimeout(() => setAnimState('exiting'), 1200))
    timersRef.current.push(
      setTimeout(() => {
        setAnimState('idle')
        setDisplayPhase(null)
      }, 1600),
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

  if (animState === 'idle' || !displayPhase) return null

  const phaseEnum = GAMEPHASE_TO_PHASE[displayPhase]
  if (!phaseEnum) return null
  const meta = PHASE_META[phaseEnum]

  const { label, Icon, color, glow } = meta

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ perspective: '1200px' }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 transition-opacity duration-300 ${
          animState === 'exiting' ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Top curtain panel */}
      <div
        className="absolute left-0 right-0 top-0 bg-[#0c0c0e] border-b border-white/[0.04]"
        style={{
          height: '50%',
          transform: animState === 'entering' || animState === 'holding'
            ? 'translateY(-100%)'
            : animState === 'exiting'
              ? 'translateY(0)'
              : 'translateY(-100%)',
          transition: animState === 'exiting' ? 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          boxShadow: animState === 'entering' || animState === 'holding'
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
          transform: animState === 'entering' || animState === 'holding'
            ? 'translateY(100%)'
            : animState === 'exiting'
              ? 'translateY(0)'
              : 'translateY(100%)',
          transition: animState === 'exiting' ? 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          boxShadow: animState === 'entering' || animState === 'holding'
            ? `0 -8px 40px ${glow}`
            : 'none',
          transitionProperty: 'transform, box-shadow',
        }}
      />

      {/* Center phase reveal */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        style={{
          opacity: animState === 'holding' ? 1 : animState === 'entering' ? 0.6 : 0,
          transition: 'opacity 300ms ease-out',
        }}
      >
        {/* Icon ring */}
        <div
          className="relative flex items-center justify-center w-20 h-20 rounded-full"
          style={{
            transform: animState === 'holding'
              ? 'scale(1) rotate(0deg)'
              : animState === 'exiting'
                ? 'scale(1.1)'
                : 'scale(0.3) rotate(-15deg)',
            transition: animState === 'exiting'
              ? 'transform 300ms ease-in'
              : 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: `0 0 60px ${glow}, inset 0 0 30px ${glow}`,
            background: `radial-gradient(circle, ${glow}, transparent 70%)`,
          }}
        >
          <Icon
            className={`h-9 w-9 ${color}`}
            style={{
              filter: `drop-shadow(0 0 12px ${glow})`,
            }}
          />
        </div>

        {/* Label */}
        <span
          className={`text-2xl font-bold tracking-wide ${color}`}
          style={{
            opacity: animState === 'holding' ? 1 : animState === 'entering' ? 0 : 1,
            transform: animState === 'holding'
              ? 'translateY(0)'
              : animState === 'entering'
                ? 'translateY(12px)'
                : 'translateY(0)',
            transition: animState === 'entering'
              ? 'opacity 250ms ease-out, transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)'
              : 'opacity 150ms ease-in, transform 150ms ease-in',
            textShadow: `0 0 40px ${glow}`,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
