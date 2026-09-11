import { useEffect } from 'react'
import { RoomEvent } from 'livekit-client'
import { useRoomContext } from '@livekit/components-react'
import { parseHostMediaRequest } from '#/features/rooms/utils/host-media'

/**
 * Mounted inside the LiveKit room: listens for host media-control requests
 * and turns off the local mic/camera accordingly.
 */
export function HostMediaListener() {
  const room = useRoomContext()

  useEffect(() => {
    const lp = room.localParticipant
    const onDataReceived = (
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string,
    ) => {
      const source = parseHostMediaRequest(payload, topic)
      if (source === 'microphone') {
        void lp.setMicrophoneEnabled(false)
      } else if (source === 'camera') {
        void lp.setCameraEnabled(false)
      }
    }
    room.on(RoomEvent.DataReceived, onDataReceived)
    return () => {
      room.off(RoomEvent.DataReceived, onDataReceived)
    }
  }, [room])

  return null
}
