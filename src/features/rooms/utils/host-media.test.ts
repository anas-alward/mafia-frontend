import { describe, expect, it } from 'vitest'
import {
  HOST_MEDIA_TOPIC,
  parseHostMediaRequest,
  sendHostMediaDisable,
} from './host-media'
import type { Room } from 'livekit-client'

function makeRoom() {
  const calls: { payload: Uint8Array; options: unknown }[] = []
  const room = {
    localParticipant: {
      publishData: (payload: Uint8Array, options: unknown) => {
        calls.push({ payload, options })
        return Promise.resolve()
      },
    },
  } as unknown as Room
  return { room, calls }
}

describe('sendHostMediaDisable', () => {
  it('publishes a reliable, addressed request with the media topic', async () => {
    const { room, calls } = makeRoom()
    sendHostMediaDisable(room, '42', 'microphone')
    expect(calls).toHaveLength(1)
    const options = calls[0].options as {
      reliable: boolean
      topic: string
      destinationIdentities: string[]
    }
    expect(options.reliable).toBe(true)
    expect(options.topic).toBe(HOST_MEDIA_TOPIC)
    expect(options.destinationIdentities).toEqual(['42'])
    const parsed = JSON.parse(new TextDecoder().decode(calls[0].payload))
    expect(parsed).toEqual({
      type: 'host_media_request',
      source: 'microphone',
      action: 'disable',
    })
  })
})

describe('parseHostMediaRequest', () => {
  it('round-trips a microphone disable request', () => {
    const payload = new TextEncoder().encode(
      JSON.stringify({
        type: 'host_media_request',
        source: 'microphone',
        action: 'disable',
      }),
    )
    expect(parseHostMediaRequest(payload, HOST_MEDIA_TOPIC)).toBe('microphone')
  })

  it('round-trips a camera disable request', () => {
    const payload = new TextEncoder().encode(
      JSON.stringify({
        type: 'host_media_request',
        source: 'camera',
        action: 'disable',
      }),
    )
    expect(parseHostMediaRequest(payload, HOST_MEDIA_TOPIC)).toBe('camera')
  })

  it('ignores payloads on a foreign topic', () => {
    const payload = new TextEncoder().encode(
      JSON.stringify({
        type: 'host_media_request',
        source: 'camera',
        action: 'disable',
      }),
    )
    expect(parseHostMediaRequest(payload, 'chat')).toBeNull()
  })

  it('ignores malformed JSON and unknown shapes', () => {
    const garbage = new TextEncoder().encode('{not json')
    expect(parseHostMediaRequest(garbage, HOST_MEDIA_TOPIC)).toBeNull()
    const wrongAction = new TextEncoder().encode(
      JSON.stringify({ type: 'host_media_request', source: 'camera', action: 'enable' }),
    )
    expect(parseHostMediaRequest(wrongAction, HOST_MEDIA_TOPIC)).toBeNull()
  })
})
