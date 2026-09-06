import { useEffect, useState } from 'react'
import { ParticipantEvent } from 'livekit-client'
import type { Room } from 'livekit-client'
import { TrackSource } from '@livekit/protocol'

// Server-side silencing: LiveKit restricts our publish sources, so the
// microphone button locks until the restriction is lifted.
export function useMicBlocked(room: Room): boolean {
  const [micBlocked, setMicBlocked] = useState(false)

  useEffect(() => {
    const lp = room.localParticipant
    const update = () => {
      const perms = lp.permissions
      if (!perms) return
      // Can be undefined at runtime despite the declared type.
      const sources = perms.canPublishSources as TrackSource[] | undefined
      setMicBlocked(
        perms.canPublish === false ||
          (sources != null &&
            sources.length > 0 &&
            !sources.includes(TrackSource.MICROPHONE)),
      )
    }
    update()
    lp.on(ParticipantEvent.ParticipantPermissionsChanged, update)
    return () => {
      lp.off(ParticipantEvent.ParticipantPermissionsChanged, update)
    }
  }, [room])

  return micBlocked
}
