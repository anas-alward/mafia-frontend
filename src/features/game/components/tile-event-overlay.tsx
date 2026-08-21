import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useGameStore } from '#/features/game/store/game-store'
import { PlayerState } from '#/features/game/components/player-state'
import {
  deriveTileEvents,
  resolveTileEventVisual,
} from '#/features/game/tile-events'
import type { TileEvent } from '#/features/game/tile-events'

const T_HOLD = 2000

function useTileEventOverlay(userId: number | null) {
  const logs = useGameStore((s) => s.logs)
  const lynchTargetId = useGameStore((s) => s.lynchTargetId)
  const detectResult = useGameStore((s) => s.detectResult)
  const clearDetectResult = useGameStore((s) => s.clearDetectResult)

  const [active, setActive] = useState<TileEvent | null>(null)
  const prevKeysRef = useRef<Set<string>>(new Set())
  const prevLogLenRef = useRef(0)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (userId == null) return

    // Logs only ever append in the store. If they shrank, the game reset, so
    // forget seen keys to let the next game re-animate.
    const prevLen = prevLogLenRef.current
    const reset = logs.length < prevLen
    if (reset) prevKeysRef.current.clear()
    const newLogStart = reset ? 0 : prevLen
    prevLogLenRef.current = logs.length

    const events = deriveTileEvents({
      logs,
      lynchTargetId,
      detectResult,
      newLogStart,
    }).filter((e) => e.targetId === userId)
    const currentKeys = new Set(events.map((e) => e.key))
    const fresh = events.find((e) => !prevKeysRef.current.has(e.key))
    prevKeysRef.current = currentKeys

    if (!fresh) return

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    if (fresh.type === 'investigate') clearDetectResult()

    setActive(fresh)
    holdTimerRef.current = setTimeout(() => setActive(null), T_HOLD)
  }, [userId, logs, lynchTargetId, detectResult, clearDetectResult])

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  return { event: active }
}

interface TileEventOverlayProps {
  userId: number | null
  children: ReactNode
}

export function TileEventOverlay({ userId, children }: TileEventOverlayProps) {
  const { event } = useTileEventOverlay(userId)

  const visual = event
    ? resolveTileEventVisual(event.type, event.roleType)
    : null

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      {children}

      <PlayerState userId={userId} />

      <AnimatePresence>
        {event && visual && (
          <motion.div
            key={event.key}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            style={{ backgroundColor: visual.bg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <visual.icon
                className="h-7 w-7"
                style={{ color: visual.accent }}
              />
              <span
                className="text-sm font-bold tracking-wider uppercase"
                style={{ color: visual.accent }}
              >
                {visual.message}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
