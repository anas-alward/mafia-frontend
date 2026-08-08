import { useState, useEffect, useCallback, useRef } from 'react'
import { useRealtimeKitMeeting, useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import { RtkStage } from '@cloudflare/realtimekit-react-ui'
import { Users, Copy, Check, ScrollText, Skull } from 'lucide-react'
import TilesGrid from '#/features/rooms/components/live/tiles-grid.tsx'
import ControlBar from '#/features/rooms/components/live/control-bar.tsx'
import CustomParticipantTile from '#/features/rooms/components/live/participant-tile'
import GameActionBar from '#/features/game/components/game-action-bar'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { GameRoleBadge } from '#/features/game/components/game-role-badge'
import { GameLog } from '#/features/game/components/game-log'
import { PhaseTransition } from '#/features/game/components/phase-transition'
import { PHASE_META } from '#/features/game/constants'
import { Phase as GamePhaseEnum } from '#/features/game/constants'
import type { GamePhase } from '#/features/game/events'

const GAMEPHASE_TO_PHASE: Partial<Record<GamePhase, GamePhaseEnum>> = {
  day: GamePhaseEnum.DAY,
  night: GamePhaseEnum.NIGHT,
  vote_result: GamePhaseEnum.VOTE_RESULT,
}

interface RoomActiveStateProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
  roomId: string
}

export function RoomActiveState({ fullScreenRef, roomId }: RoomActiveStateProps) {
  const { meeting } = useRealtimeKitMeeting()
  const participantCount = useRealtimeKitSelector(
    () => meeting.participants.joined.size + 1,
  )
  const gameStarted = useGameStore((s) => s.gameStarted)
  const phase = useGameStore((s) => s.phase)
  const roundNumber = useGameStore((s) => s.roundNumber)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const deadPlayerIds = useGameStore((s) => s.deadPlayerIds)
  const startGame = useGameStore((s) => s.startGame)
  const isHost = useMeetingStore((s) => s.isHost)

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [preGameSelectedIds, setPreGameSelectedIds] = useState<Set<number>>(new Set())

  // Reset selection when phase changes
  useEffect(() => {
    setSelectedPlayerId(null)
  }, [phase])

  const onTogglePreGamePlayer = useCallback((userId: number) => {
    setPreGameSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }, [])

  const selfParticipant = useRealtimeKitSelector(() => meeting.self)
  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser ? Number(currentUser.id) : null
  const isPreGameHost = isHost && !gameStarted

  // Self-view corner tile selectability
  let selfSelectable = false
  let selfSelected = false
  if (isPreGameHost) {
    selfSelectable = true
    selfSelected = currentUserId != null && preGameSelectedIds.has(currentUserId)
  }

  const [copied, setCopied] = useState(false)
  const copyRoomCode = useCallback(async () => {
    await navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [roomId])

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

  const [logOpen, setLogOpen] = useState(false)

  // Phase display config
  const phaseEnum = GAMEPHASE_TO_PHASE[phase]
  const phaseMeta = phaseEnum ? PHASE_META[phaseEnum] : null
  const PhaseIcon = phaseMeta?.Icon ?? null
  const aliveCount = alivePlayerIds.length
  const deadCount = deadPlayerIds.length

  return (
    <div className="relative flex flex-col h-full w-full" style={{ backgroundColor: 'var(--game-bg-deep)' }}>
      <PhaseTransition />

      {/* Ambient vignette */}
      <div className="game-vignette" />

      {/* ── Game HUD strip ── */}
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
                <Check className="h-3.5 w-3.5" style={{ color: 'var(--game-mint)' }} />
              ) : (
                <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            {gameStarted && phaseMeta && (
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold tracking-wide"
                style={{
                  color: '#1B1922',
                  backgroundColor: phaseMeta.textColor,
                  boxShadow: `0 0 16px ${phaseMeta.glow}`,
                }}
              >
                {PhaseIcon && <PhaseIcon className="h-4 w-4" />}
                <span>{phaseMeta.label}</span>
              </div>
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
              <div className="flex items-center gap-2" style={{ color: 'var(--game-mint)' }}>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--game-mint)', boxShadow: '0 0 6px var(--game-mint)' }} />
                <span>{aliveCount} alive</span>
              </div>
              {deadCount > 0 && (
                <div className="flex items-center gap-1.5" style={{ color: 'var(--game-crimson)' }}>
                  <Skull className="h-3.5 w-3.5" />
                  <span>{deadCount} dead</span>
                </div>
              )}
            </div>
          )}

          {/* Right: Role badge + player count + log toggle */}
          <div className="flex items-center gap-3">
            <GameRoleBadge />
            {gameStarted && (
              <button
                type="button"
                onClick={() => setLogOpen((prev) => !prev)}
                className="p-1.5 rounded-lg transition-all cursor-pointer"
                style={{
                  backgroundColor: logOpen ? 'var(--game-bg-elevated)' : 'transparent',
                  color: logOpen ? 'var(--game-text-primary)' : 'var(--game-text-muted)',
                }}
              >
                <ScrollText className="h-4 w-4" />
              </button>
            )}
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

      {/* Game action bar — left middle */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        <GameActionBar
          selectedPlayerId={selectedPlayerId}
          preGameSelectedIds={preGameSelectedIds}
          isPreGameHost={isPreGameHost}
          onStartGame={startGame}
        />
      </div>

      {/* Stage */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <RtkStage
          style={{
            position: 'absolute',
            inset: 0,
          }}
        >
          <TilesGrid
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            preGameSelectedIds={preGameSelectedIds}
            onTogglePreGamePlayer={onTogglePreGamePlayer}
            isPreGameHost={isPreGameHost}
          />
        </RtkStage>

        {/* Self-view corner tile */}
        <div className="absolute bottom-4 right-4 z-30 w-60 h-36 rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/[0.08]">
          <CustomParticipantTile
            participant={selfParticipant}
            isSelected={selfSelected}
            isSelectable={selfSelectable}
            onSelect={isPreGameHost ? onTogglePreGamePlayer : () => {}}
          />
        </div>

        {/* Game overlays */}
        {gameStarted && (
          <>
            {/* Right: game log sidebar */}
            {logOpen && (
              <div
                className="absolute right-0 top-0 bottom-0 z-40 w-72 border-l"
                style={{
                  backgroundColor: 'var(--game-bg-deep)',
                  borderColor: 'var(--game-border)',
                }}
              >
                <GameLog />
              </div>
            )}
          </>
        )}
      </div>

      <ControlBar fullScreenRef={fullScreenRef} />
    </div>
  )
}
