import {
  useRealtimeKitMeeting,
  useRealtimeKitSelector,
} from '@cloudflare/realtimekit-react'
import LiveParticipantTile from '#/features/rooms/components/live/participant-tile'

export function getColumns(count: number) {
  if (count <= 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
}

interface TilesGridProps {
  preGameSelectedIds: Set<number>
  onTogglePreGamePlayer: (userId: number) => void
  isPreGameHost: boolean
}

export default function TilesGrid({
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
  const localUserId = (localParticipant as any).customParticipantId as
    | string
    | undefined
  const allParticipants = remoteParticipants.filter(
    (p) =>
      (p as any).customParticipantId !== localUserId || localUserId == null,
  )
  const cols = getColumns(allParticipants.length)
  const rows = Math.ceil(allParticipants.length / cols)
  const pad = '1.5rem'
  const gap = '0.75rem'
  const itemW = `calc((100% - ${pad} - (${cols} - 1) * ${gap}) / ${cols})`
  const itemH = `calc((100% - ${pad} - (${rows} - 1) * ${gap}) / ${rows})`

  return (
    <div className="flex flex-wrap content-center justify-center h-full w-full gap-3 p-4">
      {allParticipants.map((participant) => {
        const rawUserId = participant.customParticipantId
        const numUserId = rawUserId != null ? Number(rawUserId) : NaN
        const isSelf =
          numUserId === Number(localUserId) || (participant as any).isLocal

        const isSelectable = isPreGameHost && !isSelf
        const isSelected =
          isPreGameHost &&
          !Number.isNaN(numUserId) &&
          preGameSelectedIds.has(numUserId)
        const onSelect = isPreGameHost ? onTogglePreGamePlayer : () => {}

        return (
          <div
            key={participant.id || participant.userId || 'local-participant'}
            style={{ width: itemW, height: itemH }}
          >
            <LiveParticipantTile
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
