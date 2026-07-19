import { useState, useEffect, useCallback, useRef } from 'react'
import { useRealtimeKitMeeting, useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import { RtkStage } from '@cloudflare/realtimekit-react-ui'
import { Users, Copy, Check, ScrollText } from 'lucide-react'
import TilesGrid from '#/features/rooms/components/live/tiles-grid.tsx'
import ControlBar from '#/features/rooms/components/live/control-bar.tsx'
import CustomParticipantTile from '#/features/rooms/components/live/participant-tile'
import GameActionBar from '#/features/game/components/game-action-bar'
import { useGameContext } from '#/features/game/context/game-context'
import { useRoomContext } from '#/features/rooms/context/room-context'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { GamePhaseIndicator } from '#/features/game/components/game-phase-indicator'
import { GameRoleBadge } from '#/features/game/components/game-role-badge'
import { GameLog } from '#/features/game/components/game-log'

interface RoomActiveStateProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
  roomId: string
}

export function RoomActiveState({ fullScreenRef, roomId }: RoomActiveStateProps) {
  const { meeting } = useRealtimeKitMeeting()
  const participantCount = useRealtimeKitSelector(
    () => meeting.participants.joined.size + 1,
  )
  const { gameStarted, startGame } = useGameContext()
  const { isHost } = useRoomContext()

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [preGameSelectedIds, setPreGameSelectedIds] = useState<Set<number>>(new Set())

  const onTogglePreGamePlayer = useCallback((userId: number) => {
    console.log("userId", userId)
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

  const [topBarVisible, setTopBarVisible] = useState(false)
  const topTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (e.clientY < 80) {
        setTopBarVisible(true)
        if (topTimerRef.current) {
          clearTimeout(topTimerRef.current)
          topTimerRef.current = null
        }
      } else {
        if (!topTimerRef.current) {
          topTimerRef.current = setTimeout(() => setTopBarVisible(false), 600)
        }
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (topTimerRef.current) clearTimeout(topTimerRef.current)
    }
  }, [])

  const [logOpen, setLogOpen] = useState(false)

  return (
    <div className="relative flex flex-col h-full w-full bg-[#161618]">
      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 transition-opacity duration-300 ${
          topBarVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(to bottom, rgba(22,22,24,0.95), transparent)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-[#a1a1aa]">Room</span>
          <button
            type="button"
            onClick={copyRoomCode}
            className="group flex items-center gap-2 text-base font-mono text-[#f4f4f5] bg-[#212124] hover:bg-[#2a2a2e] px-3 py-1 rounded-md transition-colors cursor-pointer"
          >
            #{roomId}
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-[#71717a] opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
          <GameRoleBadge />
        </div>
        <div className="flex items-center gap-3">
          {gameStarted && (
            <button
              type="button"
              onClick={() => setLogOpen((prev) => !prev)}
              className={`p-2 rounded-lg transition-colors ${
                logOpen
                  ? 'bg-white/10 text-[#f4f4f5]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/5'
              }`}
            >
              <ScrollText className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2 text-[#a1a1aa] text-base">
            <Users className="h-5 w-5" />
            <span>
              {participantCount} {participantCount === 1 ? 'person' : 'people'}
            </span>
          </div>
        </div>
      </div>

      {/* Phase indicator */}
      <GamePhaseIndicator />

      {/* Game action bar — sticky to left middle */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        <GameActionBar
          selectedPlayerId={selectedPlayerId}
          preGameSelectedIds={preGameSelectedIds}
          isPreGameHost={isPreGameHost}
          onStartGame={startGame}
        />
      </div>

      {/* Stage — wrapped in a plain div so flex constraints are enforced */}
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
        <div className="absolute bottom-4 right-4 z-30 w-52 h-32 rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
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
              <div className="absolute right-0 top-0 bottom-0 z-40 w-72 bg-[#161618] border-l border-white/5">
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
