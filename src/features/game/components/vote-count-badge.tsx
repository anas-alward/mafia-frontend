import { useEffect } from 'react'
import type { MouseEvent } from 'react'
import { Vote } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'
import { getVoters } from '#/features/game/api/client'

interface VoteCountBadgeProps {
  userId: number | null
}

export function VoteCountBadge({ userId }: VoteCountBadgeProps) {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const currentVotes = useGameStore((s) => s.currentVotes)
  const voteWeights = useGameStore((s) => s.voteWeights)
  const sessionId = useGameStore((s) => s.sessionId)
  const voterSelection = useGameStore((s) => s.voterSelection)
  const setVoterSelection = useGameStore((s) => s.setVoterSelection)
  const clearVoterSelection = useGameStore((s) => s.clearVoterSelection)

  // Clicking anywhere outside a vote badge hides the selection.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (
        e.target instanceof Element &&
        e.target.closest('[data-vote-count-badge]')
      ) {
        return
      }
      clearVoterSelection()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true)
  }, [clearVoterSelection])

  if (!gameStarted || userId == null) return null

  // Weighted tally: each voter's power comes from the `weight` field on
  // the `vote_cast` broadcast (e.g. Mayor counts 3). Defaults to 1 when
  // the weight is unknown (old payloads, reconnect rebuilds from logs).
  const count = Array.from(currentVotes.entries()).reduce(
    (total, [actorId, targetId]) =>
      targetId === userId ? total + (voteWeights.get(actorId) ?? 1) : total,
    0,
  )

  if (count === 0) return null

  const isSelected = voterSelection.targetId === userId

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (isSelected) {
      clearVoterSelection()
      return
    }
    // Optimistic local selection, then confirm against the server (which
    // also covers votes we may not have seen over the socket).
    const localVoters = Array.from(currentVotes.entries())
      .filter(([, targetId]) => targetId === userId)
      .map(([actorId]) => actorId)
    setVoterSelection(userId, localVoters)
    if (sessionId) {
      try {
        const voterIds = await getVoters(sessionId, userId)
        if (useGameStore.getState().voterSelection.targetId === userId) {
          setVoterSelection(userId, voterIds)
        }
      } catch {
        // endpoint unavailable — the local derivation stands
      }
    }
  }

  return (
    <button
      type="button"
      data-vote-count-badge=""
      onClick={handleClick}
      className="absolute bottom-3 right-3 z-30 flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border cursor-pointer"
      style={{
        backgroundColor: '#B98A1C',
        borderColor: '#B98A1C',
        color: '#1B1922',
      }}
    >
      <Vote className="h-3 w-3" />
      <span>{count}</span>
    </button>
  )
}
