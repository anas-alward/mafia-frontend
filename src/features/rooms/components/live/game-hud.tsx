import { useState, useEffect, useRef } from 'react'
import {
  useRealtimeKitMeeting,
  useRealtimeKitSelector,
} from '@cloudflare/realtimekit-react'
import { Users, Copy, Check, Skull } from 'lucide-react'
import { motion } from 'motion/react'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { GameRoleBadge } from '#/features/game/components/game-role-badge'
import { LiveSidebar } from '#/features/rooms/components/live/live-sidebar'
import { PHASE_META, Phase as GamePhaseEnum } from '#/features/game/constants'
import type { GamePhase } from '#/features/game/events'

const GAMEPHASE_TO_PHASE: Partial<Record<GamePhase, GamePhaseEnum>> = {
  day: GamePhaseEnum.DAY,
  night: GamePhaseEnum.NIGHT,
  vote_result: GamePhaseEnum.VOTE_RESULT,
}

export function GameHUD() {
  const roomId = useMeetingStore((s) => s.roomId)
  const gameStarted = useGameStore((s) => s.gameStarted)
  const phase = useGameStore((s) => s.phase)
  const roundNumber = useGameStore((s) => s.roundNumber)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const deadPlayerIds = useGameStore((s) => s.deadPlayerIds)

  const { meeting } = useRealtimeKitMeeting()
  const participantCount = useRealtimeKitSelector(
    () => meeting.participants.joined.size + 1,
  )

  const [hudVisible, setHudVisible] = useState(true)
  const hudTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (e.clientY < 60) {
        setHudVisible(true)
        if (hudTimerRef.current) {
          clearTimeout(hudTimerRef.current)
          hudTimerRef.current = null
        }
      } else {
        if (!hudTimerRef.current) {
          hudTimerRef.current = setTimeout(() => setHudVisible(false), 800)
        }
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current)
    }
  }, [])

  const [copied, setCopied] = useState(false)
  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const phaseEnum = GAMEPHASE_TO_PHASE[phase]
  const phaseMeta = phaseEnum ? PHASE_META[phaseEnum] : null
  const PhaseIcon = phaseMeta?.Icon ?? null
  const aliveCount = alivePlayerIds.length
  const deadCount = deadPlayerIds.length

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-50 transition-all duration-400 ease-out ${
        hudVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="game-glass flex items-center justify-between h-11 px-4">
        {/* Left: Room code + copy */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={copyRoomCode}
            className="group flex items-center gap-2 text-xs font-mono tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            style={{
              color: 'var(--game-text-primary)',
              backgroundColor: 'var(--game-bg-elevated)',
              border: '1px solid var(--game-border)',
            }}
          >
            #{roomId}
            {copied ? (
              <Check
                className="h-3.5 w-3.5"
                style={{ color: 'var(--game-mint)' }}
              />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>

          {gameStarted && phaseMeta && (
            <motion.div
              key={phase}
              initial={{ scale: 0.85, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold tracking-wide"
              style={{
                color: '#1B1922',
                backgroundColor: phaseMeta.textColor,
                boxShadow: `0 0 16px ${phaseMeta.glow}`,
              }}
            >
              {PhaseIcon && <PhaseIcon className="h-4 w-4" />}
              <span>{phaseMeta.label}</span>
            </motion.div>
          )}

          {gameStarted && roundNumber != null && (
            <span
              className="text-xs font-bold font-mono tracking-wider px-2 py-1 rounded-md"
              style={{
                color: 'var(--game-text-primary)',
                backgroundColor: 'var(--game-bg-elevated)',
              }}
            >
              R{roundNumber}
            </span>
          )}
        </div>

        {/* Center: Game stats */}
        {gameStarted && (
          <div className="flex items-center gap-5 text-xs font-semibold">
            <div
              className="flex items-center gap-2"
              style={{ color: 'var(--game-mint)' }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: 'var(--game-mint)',
                  boxShadow: '0 0 6px var(--game-mint)',
                }}
              />
              <span>{aliveCount} alive</span>
            </div>
            {deadCount > 0 && (
              <div
                className="flex items-center gap-1.5"
                style={{ color: 'var(--game-crimson)' }}
              >
                <Skull className="h-3.5 w-3.5" />
                <span>{deadCount} dead</span>
              </div>
            )}
          </div>
        )}

        {/* Right: Role badge + player count + log toggle */}
        <div className="flex items-center gap-3">
          <GameRoleBadge />
          <LiveSidebar.LogToggle />
          <div
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'var(--game-text-primary)' }}
          >
            <Users className="h-3.5 w-3.5" />
            <span>{participantCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
