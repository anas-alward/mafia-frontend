import type { Room } from 'livekit-client'

/**
 * Host media moderation over the LiveKit data channel. LiveKit's client SDK
 * cannot mute another participant's tracks directly, so the host asks the
 * target's client to comply: a small reliable data message addressed to that
 * participant's identity; the receiving client turns its own mic/camera off.
 */

export const HOST_MEDIA_TOPIC = 'host-media-control'

export type MediaSource = 'microphone' | 'camera'

export interface HostMediaRequest {
  type: 'host_media_request'
  source: MediaSource
  action: 'disable'
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function sendHostMediaDisable(
  room: Room,
  targetIdentity: string,
  source: MediaSource,
): void {
  const request: HostMediaRequest = {
    type: 'host_media_request',
    source,
    action: 'disable',
  }
  const payload = encoder.encode(JSON.stringify(request))
  void room.localParticipant.publishData(payload, {
    reliable: true,
    topic: HOST_MEDIA_TOPIC,
    destinationIdentities: [targetIdentity],
  })
}

/** Parse an incoming data payload; null when it isn't a disable request. */
export function parseHostMediaRequest(
  payload: Uint8Array,
  topic?: string,
): MediaSource | null {
  if (topic !== HOST_MEDIA_TOPIC) return null
  try {
    const data: unknown = JSON.parse(decoder.decode(payload))
    if (typeof data !== 'object' || data === null) return null
    const r = data as Record<string, unknown>
    if (r.type !== 'host_media_request' || r.action !== 'disable') return null
    if (r.source !== 'microphone' && r.source !== 'camera') return null
    return r.source
  } catch {
    return null
  }
}
