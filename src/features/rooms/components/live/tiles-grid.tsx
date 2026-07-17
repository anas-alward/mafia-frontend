import { useRealtimeKitMeeting, useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import CustomParticipantTile from '#/features/rooms/components/live/participant-tile'

export function getColumns(count: number) {
  if (count <= 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
}

export default function TilesGrid() {
  const { meeting } = useRealtimeKitMeeting()

  const localParticipant = useRealtimeKitSelector(() => meeting.self)
  const remoteParticipants = useRealtimeKitSelector(() =>
    meeting.participants.joined.toArray(),
  )
  const allParticipants = [localParticipant, ...remoteParticipants]
  const cols = getColumns(allParticipants.length)
  const rows = Math.ceil(allParticipants.length / cols)
  const pad = '2.5rem'
  const gap = '1rem'
  const itemW = `calc((100% - ${pad} - (${cols} - 1) * ${gap}) / ${cols})`
  const itemH = `calc((100% - ${pad} - (${rows} - 1) * ${gap}) / ${rows})`

  return (
    <div className="flex flex-wrap content-center justify-center h-full w-full gap-4 p-5">
      {allParticipants.map((participant) => (
        <div
          key={participant.id || participant.userId || 'local-participant'}
          style={{ width: itemW, height: itemH }}
        >
          <CustomParticipantTile participant={participant} />
        </div>
      ))}
    </div>
  )
}
