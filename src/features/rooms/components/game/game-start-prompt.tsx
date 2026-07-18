import { useState } from 'react'
import { Play, Users } from 'lucide-react'
import { useGameContext } from '#/features/rooms/context/game-context'
import { useRoomContext } from '#/features/rooms/context/room-context'
import { useAuthStore } from '#/features/auth/store/auth-store'

export function GameStartPrompt() {
  const { gameStarted, startGame } = useGameContext()
  const { participants, isHost } = useRoomContext()
  const currentUser = useAuthStore((s) => s.user)

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  if (gameStarted || !isHost) return null

  const availablePlayers = participants.filter(
    (p) => currentUser && p.userId !== Number(currentUser.id),
  )

  const togglePlayer = (userId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  const handleStart = () => {
    const playerIds = Array.from(selectedIds)
    if (playerIds.length < 5) return
    if (currentUser) {
      playerIds.push(Number(currentUser.id))
    }
    startGame(playerIds)
  }

  const totalPlayers = selectedIds.size + 1
  const canStart = totalPlayers >= 6

  return (
    <div className="bg-[#212124] border border-white/5 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Play className="h-5 w-5 text-[#a1a1aa]" />
        <h3 className="text-sm font-semibold text-[#f4f4f5]">Start Game</h3>
      </div>

      <p className="text-sm text-[#a1a1aa] mb-4">
        Select at least 5 players to start a Mafia game (minimum 6 including
        you).
      </p>

      {availablePlayers.length === 0 ? (
        <p className="text-sm text-[#71717a]">
          Waiting for players to join the room.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-4">
          {availablePlayers.map((player) => {
            const isSelected = selectedIds.has(player.userId)
            return (
              <button
                key={player.userId}
                type="button"
                onClick={() => togglePlayer(player.userId)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isSelected
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-white/5 text-[#d4d4d8] hover:bg-white/10'
                }`}
              >
                {player.username}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-[#a1a1aa]">
          <Users className="h-4 w-4" />
          <span>
            {totalPlayers} player{totalPlayers !== 1 ? 's' : ''} selected
          </span>
        </div>
        <button
          type="button"
          disabled={!canStart}
          onClick={handleStart}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            canStart
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-white/5 text-[#71717a] cursor-not-allowed'
          }`}
        >
          Start Game
        </button>
      </div>
    </div>
  )
}
