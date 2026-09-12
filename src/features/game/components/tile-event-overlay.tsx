import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { PlayerState } from '#/features/game/components/player-state'
import {
  deriveTileEvents,
  resolveActorName,
  resolveTileEventVisual,
} from '#/features/game/tile-events'
import type { TileEvent } from '#/features/game/tile-events'

const T_HOLD = 2000

function useTileEventOverlay(userId: number | null) {
  const logs = useGameStore((s) => s.logs)
  const lynchTargetId = useGameStore((s) => s.lynchTargetId)
  const detectResult = useGameStore((s) => s.detectResult)
  const clearDetectResult = useGameStore((s) => s.clearDetectResult)
  const actionSignals = useGameStore((s) => s.actionSignals)
  const actionSignalVersion = useGameStore((s) => s.actionSignalVersion)
  const gamePlayers = useGameStore((s) => s.players)
  const participants = useMeetingStore((s) => s.participants)
  const currentUser = useAuthStore((s) => s.user)
  const myUserId = currentUser ? Number(currentUser.id) : null

  const [active, setActive] = useState<TileEvent | null>(null)
  const prevKeysRef = useRef<Set<string>>(new Set())
  // null = first run: historical log/signal entries are state, not events —
  // only entries arriving while the tile is mounted should animate.
  const prevLogLenRef = useRef<number | null>(null)
  const seenSignalSeqRef = useRef<number | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (userId == null) return

    // Logs only ever append in the store. If they shrank, the game reset, so
    // forget seen keys to let the next game re-animate. On the first run the
    // full log history is state, not news — skip it.
    const prevLen = prevLogLenRef.current
    const reset = prevLen != null && logs.length < prevLen
    if (reset) prevKeysRef.current.clear()
    const newLogStart = reset ? 0 : (prevLen ?? logs.length)
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

  // Server-routed action signals: kill/heal/vote/... arrive here per
  // recipient, decided backend-side. Shown on the target's tile.
  useEffect(() => {
    if (userId == null) return
    if (seenSignalSeqRef.current == null) {
      // First run: signals queued before this tile mounted are history.
      seenSignalSeqRef.current = actionSignalVersion
      return
    }
    const seenSeq = seenSignalSeqRef.current
    const freshSignals = actionSignals.filter(
      (s) => s.seq > seenSeq && s.target_id === userId,
    )
    seenSignalSeqRef.current = actionSignalVersion
    if (freshSignals.length === 0) return

    const latest = freshSignals[freshSignals.length - 1]
    const actorName = resolveActorName(
      latest.actor_id,
      gamePlayers,
      participants,
    )
    // The actor already knows what they did — the animation alone is enough.
    // Everyone else sees who acted ("Voted by X").
    const isOwnAction = latest.actor_id != null && latest.actor_id === myUserId

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    setActive({
      type: latest.action_type,
      targetId: latest.target_id,
      detail: isOwnAction ? undefined : actorName,
      key: `signal:${latest.seq}`,
    })
    holdTimerRef.current = setTimeout(() => setActive(null), T_HOLD)
  }, [
    userId,
    actionSignals,
    actionSignalVersion,
    gamePlayers,
    participants,
    myUserId,
  ])

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  return { event: active }
}

interface TileEventOverlayProps {
  userId: number | null
  children: ReactNode | ((isAnimating: boolean) => ReactNode)
}

export function TileEventOverlay({ userId, children }: TileEventOverlayProps) {
  const { t } = useTranslation()
  const { event } = useTileEventOverlay(userId)
  const isAnimating = event != null

  const visual = event
    ? resolveTileEventVisual(event.type, event.roleType)
    : null

  // Constants-driven strings are translated here at the render site (the
  // ACTION_REGISTRY / TILE_EVENT_VISUALS shape stays untouched).
  const eventMessage = (() => {
    if (!event || !visual) return null
    if (event.type === 'saved') {
      return t('game.tileEvent.saved', { defaultValue: visual.message })
    }
    if (event.type === 'investigate') {
      const roleType = event.roleType?.trim().toLowerCase()
      if (roleType === 'mafia' || roleType === 'town') {
        return t(`game.teams.${roleType}`, { defaultValue: visual.message })
      }
      return visual.message
    }
    return t(`game.actions.${event.type}.eventMessage`, {
      defaultValue: visual.message,
    })
  })()
  const roleName =
    event?.roleCode && event.roleName
      ? t(`game.roles.${event.roleCode}.name`, {
          defaultValue: event.roleName,
        })
      : event?.roleName
  const voteDetail =
    event?.type === 'vote' && event.detail
      ? t('game.tileEvent.votedBy', {
          name: event.detail,
          defaultValue: `Voted by ${event.detail}`,
        })
      : event?.detail

  return (
    <div className="relative h-full w-full rounded-lg">
      {typeof children === 'function' ? children(isAnimating) : children}

      <PlayerState userId={userId} />

      <AnimatePresence>
        {event && visual && (
          <motion.div
            key={event.key}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none rounded-lg"
            style={{ backgroundColor: visual.bg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.5, ease: 'easeOut' },
            }}
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
                {roleName ?? eventMessage}
              </span>
              {(roleName || voteDetail) && (
                <span
                  className="text-xs font-semibold tracking-wide uppercase"
                  style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                >
                  {roleName ? eventMessage : voteDetail}
                </span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
