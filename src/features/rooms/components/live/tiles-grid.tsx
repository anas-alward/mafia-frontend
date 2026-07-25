import { useRealtimeKitMeeting, useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import CustomParticipantTile from '#/features/rooms/components/live/participant-tile'
import { useGameStore } from '#/features/game/store/game-store'
import { useAuthStore } from '#/features/auth/store/auth-store'

export function getColumns(count: number) {
  if (count <= 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
}

interface TilesGridProps {
  selectedPlayerId: number | null
  onSelectPlayer: (userId: number) => void
  preGameSelectedIds: Set<number>
  onTogglePreGamePlayer: (userId: number) => void
  isPreGameHost: boolean
}

export default function TilesGrid({
  selectedPlayerId,
  onSelectPlayer,
  preGameSelectedIds,
  onTogglePreGamePlayer,
  isPreGameHost,
}: TilesGridProps) {
  const { meeting } = useRealtimeKitMeeting()

  const localParticipant = useRealtimeKitSelector(() => meeting.self)
  const remoteParticipants = useRealtimeKitSelector(() =>
    meeting.participants.joined.toArray(),
  )
  // Only remote participants in the grid — self is rendered as a corner tile
  const localUserId = (localParticipant as any).customParticipantId as string | undefined
  const allParticipants = remoteParticipants.filter(
    (p) => (p as any).customParticipantId !== localUserId || localUserId == null,
  )
  const cols = getColumns(allParticipants.length)
  const rows = Math.ceil(allParticipants.length / cols)
  const pad = '2.5rem'
  const gap = '1rem'
  const itemW = `calc((100% - ${pad} - (${cols} - 1) * ${gap}) / ${cols})`
  const itemH = `calc((100% - ${pad} - (${rows} - 1) * ${gap}) / ${rows})`

  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser ? Number(currentUser.id) : null
  const gameStarted = useGameStore((s) => s.gameStarted)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const requiredActions = useGameStore((s) => s.requiredActions)
  const myAlive = currentUserId != null && alivePlayerIds.includes(currentUserId)
  const validTargets = new Set(requiredActions.flatMap((a) => a.target_options))

  return (
    <div className="flex flex-wrap content-center justify-center h-full w-full gap-4 p-5">
      {allParticipants.map((participant) => {

        const rawUserId = participant.customParticipantId
        const numUserId = rawUserId != null ? Number(rawUserId) : NaN
        const isSelf = !Number.isNaN(numUserId) && numUserId === currentUserId || (participant as any).isLocal
        const isAlive = !Number.isNaN(numUserId) && alivePlayerIds.includes(numUserId)

        let isSelectable: boolean
        let isSelected: boolean
        let onSelect: (userId: number) => void

        if (isPreGameHost) {
          isSelectable = !isSelf
          isSelected = !Number.isNaN(numUserId) && preGameSelectedIds.has(numUserId)
          onSelect = onTogglePreGamePlayer
        } else {
          isSelectable = gameStarted && isAlive && myAlive && !isSelf && validTargets.has(numUserId)
          isSelected = !Number.isNaN(numUserId) && numUserId === selectedPlayerId
          onSelect = onSelectPlayer
        }

        return (
          <div
            key={participant.id || participant.userId || 'local-participant'}
            style={{ width: itemW, height: itemH }}
          >
            <CustomParticipantTile
              participant={participant}
              isSelected={isSelected}
              isSelectable={isSelectable}
              onSelect={onSelect}
            />
          </div>
        )
      })}
    </div>
  )
}
