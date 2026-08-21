import { useState } from 'react'
import {
  useRealtimeKitMeeting,
  useRealtimeKitSelector,
} from '@cloudflare/realtimekit-react'
import { Users, Copy, Check, Skull } from 'lucide-react'
import { motion } from 'motion/react'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
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
    <div className="shrink-0 z-50">
      <div
        className="flex items-center justify-between h-11 px-4"
        style={{
          backgroundColor: 'var(--game-bg-deep)',
        }}
      >
        {/* Left: Room code + copy */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyRoomCode}
            className="group flex items-center gap-2 text-xs font-mono tracking-wider cursor-pointer"
            style={{ color: 'var(--game-text-primary)' }}
          >
            #{roomId}
            {copied ? (
              <Check
                className="h-3.5 w-3.5"
                style={{ color: 'var(--game-mint)' }}
              />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {gameStarted && (
            <span
              className="text-xs select-none"
              style={{ color: 'var(--game-text-muted)' }}
            >
              |
            </span>
          )}

          {gameStarted && phaseMeta && (
            <motion.div
              key={phase}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold tracking-wide"
              style={{
                color: '#1B1922',
                backgroundColor: phaseMeta.textColor,
                boxShadow: `0 0 16px ${phaseMeta.glow}`,
              }}
              initial={{ scale: 0.85, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {PhaseIcon && <PhaseIcon className="h-4 w-4" />}
              <span>{phaseMeta.label}</span>
            </motion.div>
          )}

          {gameStarted && roundNumber != null && (
            <>
              <span
                className="text-xs select-none"
                style={{ color: 'var(--game-text-muted)' }}
              >
                |
              </span>
              <span
                className="text-xs font-bold font-mono tracking-wider px-2 py-1 rounded-md"
                style={{
                  color: 'var(--game-text-primary)',
                  backgroundColor: 'var(--game-bg-elevated)',
                }}
              >
                R{roundNumber}
              </span>
            </>
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

        {/* Right: player count + log toggle */}
        <div className="flex items-center gap-3">
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
