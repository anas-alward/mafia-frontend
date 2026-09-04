import { create } from 'zustand'

interface MediaConfigStore {
  mediaStream: MediaStream | null
  videoEnabled: boolean
  audioEnabled: boolean
  videoDevices: MediaDeviceInfo[]
  audioDevices: MediaDeviceInfo[]
  selectedVideoDevice: string
  selectedAudioDevice: string
  mediaReady: boolean
  mediaError: string | null

  startCamera: () => Promise<void>
  stopCamera: () => void
  toggleAudio: () => void
  toggleVideo: () => void
  changeVideoDevice: (deviceId: string) => Promise<void>
  changeAudioDevice: (deviceId: string) => Promise<void>
  reset: () => void
}

const initialState = {
  mediaStream: null,
  videoEnabled: true,
  audioEnabled: true,
  videoDevices: [],
  audioDevices: [],
  selectedVideoDevice: '',
  selectedAudioDevice: '',
  mediaReady: false,
  mediaError: null,
}

export const useMediaConfigStore = create<MediaConfigStore>((set, get) => ({
  ...initialState,

  startCamera: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      const devices = await navigator.mediaDevices.enumerateDevices()
      // enumerateDevices can return duplicate deviceIds (e.g. 'default' and
      // 'communications' pointing at the same mic) — dedupe for stable keys
      const unique = (list: MediaDeviceInfo[]) => [
        ...new Map(list.map((d) => [d.deviceId, d])).values(),
      ]
      const videoDevices = unique(
        devices.filter((d) => d.kind === 'videoinput'),
      )
      const audioDevices = unique(
        devices.filter((d) => d.kind === 'audioinput'),
      )

      const videoTrack = stream.getVideoTracks()[0]
      const audioTrack = stream.getAudioTracks()[0]

      set({
        mediaStream: stream,
        mediaReady: true,
        videoDevices,
        audioDevices,
        selectedVideoDevice: videoTrack.getSettings().deviceId ?? '',
        selectedAudioDevice: audioTrack.getSettings().deviceId ?? '',
      })
    } catch (err) {
      set({
        mediaReady: true,
        mediaError:
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Camera and microphone access was denied. Please allow permissions to join.'
            : 'Could not access camera or microphone.',
      })
    }
  },

  stopCamera: () => {
    const { mediaStream } = get()
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop())
      set({ mediaStream: null })
    }
  },

  toggleAudio: () => {
    const { mediaStream, audioEnabled } = get()
    const track = mediaStream?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      set({ audioEnabled: track.enabled })
    }
  },

  toggleVideo: () => {
    const { mediaStream, videoEnabled } = get()
    const track = mediaStream?.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      set({ videoEnabled: track.enabled })
    }
  },

  changeVideoDevice: async (deviceId: string) => {
    const { mediaStream } = get()
    if (!mediaStream) return

    set({ selectedVideoDevice: deviceId })

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false,
      })
      const newTrack = newStream.getVideoTracks()[0]
      const oldTrack = mediaStream.getVideoTracks()[0]
      mediaStream.removeTrack(oldTrack)
      oldTrack.stop()
      mediaStream.addTrack(newTrack)
      set({ videoEnabled: true })
    } catch {
      // Silently fail — keep current track
    }
  },

  changeAudioDevice: async (deviceId: string) => {
    const { mediaStream } = get()
    if (!mediaStream) return

    set({ selectedAudioDevice: deviceId })

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId: { exact: deviceId } },
      })
      const newTrack = newStream.getAudioTracks()[0]
      const oldTrack = mediaStream.getAudioTracks()[0]
      mediaStream.removeTrack(oldTrack)
      oldTrack.stop()
      mediaStream.addTrack(newTrack)
      set({ audioEnabled: true })
    } catch {
      // Silently fail — keep current track
    }
  },

  reset: () => {
    get().stopCamera()
    set({ ...initialState })
  },
}))
