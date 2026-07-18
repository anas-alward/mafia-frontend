import { useGameContext } from '#/features/rooms/context/game-context'
import { useRoomContext } from '#/features/rooms/context/room-context'
import { useAuthStore } from '#/features/auth/store/auth-store'

export function GameVotePanel() {
  const { phase, alivePlayerIds, currentVotes, hasVotedThisPhase, castVote } =
    useGameContext()
  const { participants } = useRoomContext()
  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser ? Number(currentUser.id) : null

  if (phase !== 'day' || !currentUserId) return null

  const voteTargets = participants
    .filter((p) => alivePlayerIds.includes(p.userId) && p.userId !== currentUserId)
    .map((p) => ({
      userId: p.userId,
      username: p.username,
      votes: Array.from(currentVotes.values()).filter((id) => id === p.userId)
        .length,
    }))

  if (voteTargets.length === 0) {
    return (
      <div className="bg-[#212124] border border-white/5 rounded-lg p-4">
        <p className="text-sm text-[#71717a] text-center">
          No other alive players to vote for.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#212124] border border-white/5 rounded-lg p-4">
      <h3 className="text-sm font-medium text-[#f4f4f5] mb-3">
        Cast your vote
      </h3>
      <div className="flex flex-wrap gap-2">
        {voteTargets.map((target) => {
          const isVoted = currentVotes.get(currentUserId) === target.userId
          return (
            <button
              key={target.userId}
              type="button"
              disabled={hasVotedThisPhase}
              onClick={() => castVote(target.userId)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isVoted
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : hasVotedThisPhase
                    ? 'bg-white/5 text-[#71717a] cursor-not-allowed'
                    : 'bg-white/5 text-[#d4d4d8] hover:bg-white/10'
              }`}
            >
              <span>{target.username}</span>
              {target.votes > 0 && (
                <span className="text-xs text-[#71717a]">({target.votes})</span>
              )}
            </button>
          )
        })}
      </div>
      {hasVotedThisPhase && (
        <p className="text-xs text-[#71717a] mt-2">Vote submitted.</p>
      )}
    </div>
  )
}
