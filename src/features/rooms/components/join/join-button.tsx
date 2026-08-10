import { LogIn, Loader2 } from 'lucide-react'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useMediaConfigStore } from '#/features/rooms/store/media-config-store'

interface JoinButtonProps {
  isJoining: boolean
  initError: string | null
  onJoin: (token: string) => void
  onDismissError: () => void
}

export function JoinButton({
  isJoining,
  initError,
  onJoin,
  onDismissError,
}: JoinButtonProps) {
  const wsState = useMeetingStore((s) => s.wsState)
  const isReturningUser = useMeetingStore((s) => s.isReturningUser)
  const authToken = useMeetingStore((s) => s.authToken)
  const joinRequestStatus = useMeetingStore((s) => s.joinRequestStatus)
  const setJoinRequestStatus = useMeetingStore((s) => s.setJoinRequestStatus)
  const sendJoinRequest = useMeetingStore((s) => s.sendJoinRequest)

  const mediaReady = useMediaConfigStore((s) => s.mediaReady)

  const handleJoin = () => {
    if (isReturningUser) {
      if (!authToken) return
      onJoin(authToken)
    } else {
      setJoinRequestStatus('requested')
      sendJoinRequest()
    }
  }

  const isWaiting = joinRequestStatus === 'requested'
  const wasRejected = joinRequestStatus === 'rejected'

  return (
    <div className="space-y-3">
      {wsState === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
          <p className="text-sm text-red-400">Connection lost.</p>
        </div>
      )}

      {initError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
          <p className="text-sm text-red-400">{initError}</p>
          <button
            type="button"
            onClick={() => {
              onDismissError()
              setJoinRequestStatus('idle')
            }}
            className="mt-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#f4f4f5] text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleJoin}
        disabled={
          isWaiting ||
          !mediaReady ||
          (!authToken && isReturningUser) ||
          wsState === 'error' ||
          isJoining
        }
        className="w-full h-12 rounded-lg bg-[#60a5fa] hover:bg-[#3b82f6] disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
      >
        {isJoining ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : !authToken && isReturningUser ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting to room...
          </>
        ) : !mediaReady ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting camera...
          </>
        ) : isWaiting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Waiting for host...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            {isReturningUser ? 'Join meeting' : 'Ask to join'}
          </>
        )}
      </button>

      {wasRejected && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
          <p className="text-sm text-red-400">
            The host declined your request. You can try again.
          </p>
        </div>
      )}
    </div>
  )
}
