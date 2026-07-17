import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Video, VideoOff, LogIn, Loader2, ChevronDown, Wifi } from 'lucide-react'

interface MeetingSetupStateProps {
  roomId: string
  isReturningUser: boolean
  joinRequestStatus: 'idle' | 'requested' | 'accepted' | 'rejected'
  wsState: string
  onReconnect: () => void
  authToken: string | null
  onJoin: () => void
  isJoining?: boolean
}

export function MeetingSetupState({
  roomId,
  isReturningUser,
  joinRequestStatus,
  wsState,
  onReconnect,
  authToken,
  onJoin,
  isJoining = false,
}: MeetingSetupStateProps) {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [mediaReady, setMediaReady] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera preview immediately using native getUserMedia
  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        setMediaStream(stream)
        setMediaReady(true)

        const devices = await navigator.mediaDevices.enumerateDevices()
        setVideoDevices(devices.filter((d) => d.kind === 'videoinput'))
        setAudioDevices(devices.filter((d) => d.kind === 'audioinput'))

        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) setSelectedVideoDevice(videoTrack.getSettings().deviceId ?? '')

        const audioTrack = stream.getAudioTracks()[0]
        if (audioTrack) setSelectedAudioDevice(audioTrack.getSettings().deviceId ?? '')
      } catch (err) {
        if (!cancelled) {
          setMediaError(
            err instanceof DOMException && err.name === 'NotAllowedError'
              ? 'Camera and microphone access was denied. Please allow permissions to join.'
              : 'Could not access camera or microphone.',
          )
          setMediaReady(true)
        }
      }
    }

    start()
    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  // Wire video element to media stream
  useEffect(() => {
    const el = videoRef.current
    if (!el || !mediaStream) return
    el.srcObject = mediaStream
    return () => { el.srcObject = null }
  }, [mediaStream])

  const toggleAudio = useCallback(() => {
    if (!streamRef.current) return
    const track = streamRef.current.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setAudioEnabled(track.enabled)
    }
  }, [])

  const toggleVideo = useCallback(() => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setVideoEnabled(track.enabled)
    }
  }, [])

  const handleVideoDeviceChange = useCallback(async (deviceId: string) => {
    setSelectedVideoDevice(deviceId)
    if (!streamRef.current) return
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false,
      })
      const newTrack = newStream.getVideoTracks()[0]
      const oldTrack = streamRef.current.getVideoTracks()[0]
      if (oldTrack) {
        streamRef.current.removeTrack(oldTrack)
        oldTrack.stop()
      }
      streamRef.current.addTrack(newTrack)
      if (videoRef.current) videoRef.current.srcObject = streamRef.current
      setVideoEnabled(true)
    } catch {
      // Silently fail — keep current track
    }
  }, [])

  const handleAudioDeviceChange = useCallback(async (deviceId: string) => {
    setSelectedAudioDevice(deviceId)
    if (!streamRef.current) return
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId: { exact: deviceId } },
      })
      const newTrack = newStream.getAudioTracks()[0]
      const oldTrack = streamRef.current.getAudioTracks()[0]
      if (oldTrack) {
        streamRef.current.removeTrack(oldTrack)
        oldTrack.stop()
      }
      streamRef.current.addTrack(newTrack)
      setAudioEnabled(true)
    } catch {
      // Silently fail — keep current track
    }
  }, [])

  const isWaiting = joinRequestStatus === 'requested'
  const wasRejected = joinRequestStatus === 'rejected'

  return (
    <div className="flex items-center justify-center h-full bg-[#161618]">
      <div className="w-full max-w-lg mx-auto px-6 py-10 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-[#f4f4f5]">
            {isReturningUser ? 'Welcome back' : 'Ready to join?'}
          </h2>
          <span className="inline-block font-mono text-sm text-[#60a5fa] bg-[#212124] px-3 py-1 rounded-lg">
            #{roomId}
          </span>
          <p className="text-sm text-[#a1a1aa]">
            {isReturningUser
              ? 'Set up your audio and video before joining.'
              : 'Set up your audio and video, then ask to join.'}
          </p>
          {mediaError && (
            <p className="text-sm text-amber-400">{mediaError}</p>
          )}
        </div>

        {/* Video preview */}
        <div className="relative bg-[#212124] rounded-xl overflow-hidden aspect-video ring-1 ring-white/5">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ visibility: mediaReady && videoEnabled && !mediaError ? 'visible' : 'hidden' }}
          />
          {!mediaReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#212124] to-[#161618]">
              <Loader2 className="h-8 w-8 animate-spin text-[#71717a]" />
            </div>
          )}
          {mediaReady && (!videoEnabled || mediaError) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#212124] to-[#161618]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                  <VideoOff className="h-6 w-6 text-[#71717a]" />
                </div>
                <span className="text-xs text-[#71717a]">
                  {mediaError ? 'Camera unavailable' : 'Camera off'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Device selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
              Camera
            </label>
            <div className="relative">
              <select
                value={selectedVideoDevice}
                onChange={(e) => handleVideoDeviceChange(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/5 bg-[#212124] pl-3 pr-8 text-sm text-[#f4f4f5] appearance-none focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:ring-offset-1 focus:ring-offset-[#161618]"
              >
                {videoDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
              Microphone
            </label>
            <div className="relative">
              <select
                value={selectedAudioDevice}
                onChange={(e) => handleAudioDeviceChange(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/5 bg-[#212124] pl-3 pr-8 text-sm text-[#f4f4f5] appearance-none focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:ring-offset-1 focus:ring-offset-[#161618]"
              >
                {audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Mic ${d.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a]" />
            </div>
          </div>
        </div>

        {/* Media toggles */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggleAudio}
            disabled={!!mediaError}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              audioEnabled
                ? 'bg-[#60a5fa] text-white hover:bg-[#3b82f6]'
                : 'bg-[#212124] text-[#ef4444] hover:bg-[#2a2a2e] ring-1 ring-white/5'
            } disabled:opacity-40`}
          >
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={toggleVideo}
            disabled={!!mediaError}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              videoEnabled
                ? 'bg-[#60a5fa] text-white hover:bg-[#3b82f6]'
                : 'bg-[#212124] text-[#ef4444] hover:bg-[#2a2a2e] ring-1 ring-white/5'
            } disabled:opacity-40`}
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
        </div>

        {/* Action area */}
        <div className="space-y-3">
          {wsState === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
              <p className="text-sm text-red-400 mb-3">
                Connection lost. Please reconnect to continue.
              </p>
              <button
                type="button"
                onClick={onReconnect}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#f4f4f5] text-sm transition-colors"
              >
                <Wifi className="h-4 w-4" />
                Reconnect
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onJoin}
            disabled={isWaiting || !mediaReady || (!authToken && isReturningUser) || wsState === 'error' || isJoining}
            className="w-full h-12 rounded-lg bg-[#60a5fa] hover:bg-[#3b82f6] disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : !authToken && isReturningUser ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting to room...
              </>
            ) : !mediaReady ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting camera...
              </>
            ) : isWaiting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for host...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                {isReturningUser ? 'Join meeting' : 'Ask to join'}
              </>
            )}
          </button>

          {wasRejected && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
              <p className="text-sm text-red-400">
                The host declined your request. You can try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
