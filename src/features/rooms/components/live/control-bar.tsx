import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react'
import {
  Users,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize,
  Minimize,
  WifiOff,
  Play,
  Send,
  RotateCcw,
  X,
} from 'lucide-react'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useGameStore } from '#/features/game/store/game-store'
import { useLiveSidebar } from '#/features/rooms/components/live/live-sidebar'
import StartGameTooltip from '#/features/rooms/components/live/start-game-tooltip'
import { Phase } from '#/features/game/constants'

interface ControlBarProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
  isPreGameHost: boolean
  onStartGame: (playerIds: number[]) => void
}

export default function ControlBar({
  fullScreenRef,
  isPreGameHost,
  onStartGame,
}: ControlBarProps) {
  const {
    localParticipant,
    isMicrophoneEnabled: audioEnabled,
    isCameraEnabled: videoEnabled,
  } = useLocalParticipant()
  const room = useRoomContext()
  const allParticipants = useParticipants()
  const wsState = useMeetingStore((s) => s.wsState)
  const sendError = useMeetingStore((s) => s.sendError)
  const joinRequests = useMeetingStore((s) => s.joinRequests)
  const isHost = useMeetingStore((s) => s.isHost)
  const count = joinRequests.length
  const { activeTab, toggle } = useLiveSidebar()

  // Game state
  const gameStarted = useGameStore((s) => s.gameStarted)
  const phase = useGameStore((s) => s.phase)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const currentVotes = useGameStore((s) => s.currentVotes)
  const submitVotes = useGameStore((s) => s.submitVotes)
  const submitVoteResult = useGameStore((s) => s.submitVoteResult)
  const resetGame = useGameStore((s) => s.resetGame)
  const cancelGame = useGameStore((s) => s.cancelGame)

  const allVoted = useMemo(
    () => alivePlayerIds.every((id) => currentVotes.has(id)),
    [alivePlayerIds, currentVotes],
  )

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showStartTooltip, setShowStartTooltip] = useState(false)
  const startBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      fullScreenRef.current?.requestFullscreen()
    }
  }, [fullScreenRef])

  const orbBase =
    'relative flex items-center justify-center h-9 w-9 rounded-xl border transition-all duration-200 cursor-pointer'

  return (
    <div className="shrink-0 z-50 flex flex-col">
      {/* Connection error banner */}
      {(wsState === 'closed' || wsState === 'error' || sendError) && (
        <div
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
          style={{
            backgroundColor: 'rgba(240, 96, 107, 0.12)',
            borderBottom: '1px solid rgba(240, 96, 107, 0.2)',
            color: 'var(--game-crimson)',
          }}
        >
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs">
            {sendError || 'Connection lost. Check your network.'}
          </span>
        </div>
      )}

      {/* Main bar */}
      <div
        className="flex items-center justify-between h-14 px-5"
        style={{
          backgroundColor: 'var(--game-bg-deep)',
        }}
      >
        {/* Left: game management actions */}
        <div className="flex items-center gap-1.5">
          {/* Start Game (pre-game host) */}
          {!gameStarted && isPreGameHost && (
            <>
              <button
                ref={startBtnRef}
                type="button"
                onClick={() => setShowStartTooltip((prev) => !prev)}
                title="Start Game"
                className={`${orbBase} cursor-pointer`}
                style={{
                  color: 'var(--game-gold)',
                  backgroundColor: 'rgba(237, 184, 58, 0.1)',
                  borderColor: 'rgba(237, 184, 58, 0.3)',
                }}
              >
                <Play className="h-4 w-4" />
              </button>
              <StartGameTooltip
                anchorRef={startBtnRef}
                participants={allParticipants}
                onStartGame={onStartGame}
                isOpen={showStartTooltip}
                onClose={() => setShowStartTooltip(false)}
              />
            </>
          )}

          {/* Submit Votes (host, day phase) */}
          {gameStarted && phase === Phase.DAY && isHost && (
            <button
              type="button"
              disabled={!allVoted}
              onClick={submitVotes}
              title={`Submit Votes${alivePlayerIds.length > 0 ? ` (${currentVotes.size}/${alivePlayerIds.length})` : ''}`}
              className={`${orbBase} ${allVoted ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={{
                color: allVoted ? 'var(--game-gold)' : 'var(--game-text-muted)',
                backgroundColor: allVoted
                  ? 'rgba(237, 184, 58, 0.08)'
                  : 'transparent',
                borderColor: allVoted
                  ? 'rgba(237, 184, 58, 0.3)'
                  : 'var(--game-border)',
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          )}

          {/* Resolve vote (host, vote_result phase) */}
          {gameStarted && phase === Phase.VOTE_RESULT && isHost && (
            <button
              type="button"
              onClick={submitVoteResult}
              title="Resolve"
              className={`${orbBase} cursor-pointer`}
              style={{
                color: '#F5925E',
                backgroundColor: 'rgba(245, 146, 94, 0.08)',
                borderColor: 'rgba(245, 146, 94, 0.3)',
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          )}

          {/* Separator */}
          {gameStarted && isHost && (
            <div
              className="w-px h-6 mx-1"
              style={{ backgroundColor: 'var(--game-border)' }}
            />
          )}

          {/* Reset game (host) */}
          {gameStarted && isHost && (
            <button
              type="button"
              onClick={resetGame}
              title="Reset Game"
              className={`${orbBase} cursor-pointer`}
              style={{
                color: 'var(--game-text-muted)',
                backgroundColor: 'transparent',
                borderColor: 'var(--game-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--game-text-primary)'
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--game-text-muted)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          {/* Cancel game (host) */}
          {gameStarted && isHost && (
            <button
              type="button"
              onClick={cancelGame}
              title="Cancel Game"
              className={`${orbBase} cursor-pointer`}
              style={{
                color: 'var(--game-crimson)',
                backgroundColor: 'transparent',
                borderColor: 'rgba(240, 96, 107, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(240, 96, 107, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Fullscreen (always visible, non-game) */}
          {!gameStarted && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:bg-[var(--game-bg-elevated)]"
              style={{ color: 'var(--game-text-muted)' }}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Center: media controls */}
        <div className="flex items-center gap-2">
          {/* Mic */}
          <button
            type="button"
            onClick={() => localParticipant.setMicrophoneEnabled(!audioEnabled)}
            className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border"
            style={{
              color: audioEnabled
                ? 'var(--game-text-primary)'
                : 'var(--game-crimson)',
              backgroundColor: audioEnabled
                ? 'var(--game-bg-elevated)'
                : 'rgba(240, 96, 107, 0.12)',
              borderColor: audioEnabled
                ? 'var(--game-border)'
                : 'rgba(240, 96, 107, 0.25)',
            }}
            aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {audioEnabled ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
          </button>

          {/* Camera */}
          <button
            type="button"
            onClick={() => localParticipant.setCameraEnabled(!videoEnabled)}
            className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border"
            style={{
              color: videoEnabled
                ? 'var(--game-text-primary)'
                : 'var(--game-crimson)',
              backgroundColor: videoEnabled
                ? 'var(--game-bg-elevated)'
                : 'rgba(240, 96, 107, 0.12)',
              borderColor: videoEnabled
                ? 'var(--game-border)'
                : 'rgba(240, 96, 107, 0.25)',
            }}
            aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )}
          </button>

          {/* Leave */}
          <button
            type="button"
            onClick={async () => {
              await room.disconnect()
            }}
            className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border"
            style={{
              color: '#fff',
              backgroundColor: 'var(--game-crimson)',
              borderColor: 'var(--game-crimson)',
            }}
            aria-label="Leave meeting"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
        </div>

        {/* Right: fullscreen (game) + join requests */}
        <div className="flex items-center gap-1.5">
          {/* Fullscreen (during game) */}
          {gameStarted && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:bg-[var(--game-bg-elevated)]"
              style={{ color: 'var(--game-text-muted)' }}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => toggle('requests')}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer border text-xs font-semibold"
            style={{
              color:
                activeTab === 'requests'
                  ? 'var(--game-text-primary)'
                  : 'var(--game-text-muted)',
              backgroundColor:
                activeTab === 'requests'
                  ? 'var(--game-bg-elevated)'
                  : 'transparent',
              borderColor:
                activeTab === 'requests' ? 'var(--game-border)' : 'transparent',
            }}
            aria-label="Toggle join requests"
          >
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Requests</span>
            {count > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 text-[10px] font-bold text-white min-w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none px-1"
                style={{ backgroundColor: 'var(--game-crimson)' }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
