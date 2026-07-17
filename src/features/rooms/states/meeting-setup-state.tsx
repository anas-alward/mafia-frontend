import { useState, useRef, useEffect, useCallback } from 'react'
import { useRealtimeKitMeeting, useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import { Mic, MicOff, Video, VideoOff, LogIn, Loader2, ChevronDown } from 'lucide-react'

interface MeetingSetupStateProps {
  roomId: string
  isReturningUser: boolean
  joinRequestStatus: 'idle' | 'requested' | 'accepted' | 'rejected'
  onSendJoinRequest: () => void
}

export function MeetingSetupState({
  roomId,
  isReturningUser,
  joinRequestStatus,
  onSendJoinRequest,
}: MeetingSetupStateProps) {
  const { meeting } = useRealtimeKitMeeting()

  const name = useRealtimeKitSelector(() => meeting?.self.name ?? null)
  const videoEnabled = useRealtimeKitSelector(() => meeting?.self.videoEnabled ?? false)
  const audioEnabled = useRealtimeKitSelector(() => meeting?.self.audioEnabled ?? false)

  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [mediaReady, setMediaReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!meeting || initializedRef.current) return
    initializedRef.current = true

    meeting.self.setupTracks({ video: true, audio: true })
      .then(() => {
        setMediaReady(true)
        return Promise.all([
          meeting.self.getVideoDevices(),
          meeting.self.getAudioDevices(),
        ])
      })
      .then(([vDevices, aDevices]) => {
        setVideoDevices(vDevices)
        setAudioDevices(aDevices)
        const current = meeting.self.getCurrentDevices()
        if (current.video) setSelectedVideoDevice(current.video.deviceId)
        if (current.audio) setSelectedAudioDevice(current.audio.deviceId)
      })
      .catch(() => {
        setMediaReady(true)
      })
  }, [meeting])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !meeting) return
    meeting.self.registerVideoElement(el, true)
    return () => { meeting.self.deregisterVideoElement(el, true) }
  }, [meeting])

  const handleJoin = useCallback(async () => {
    if (!meeting) return
    setIsJoining(true)
    setJoinError(null)

    if (isReturningUser) {
      try {
        await meeting.join()
      } catch (err) {
        setJoinError(err instanceof Error ? err.message : 'Failed to join meeting')
        setIsJoining(false)
      }
    } else {
      onSendJoinRequest()
    }
  }, [meeting, isReturningUser, onSendJoinRequest])

  const toggleAudio = useCallback(() => {
    if (!meeting) return
    if (audioEnabled) meeting.self.disableAudio()
    else meeting.self.enableAudio()
  }, [meeting, audioEnabled])

  const toggleVideo = useCallback(() => {
    if (!meeting) return
    if (videoEnabled) meeting.self.disableVideo()
    else meeting.self.enableVideo()
  }, [meeting, videoEnabled])

  const handleVideoDeviceChange = useCallback(async (deviceId: string) => {
    if (!meeting) return
    setSelectedVideoDevice(deviceId)
    const device = videoDevices.find((d) => d.deviceId === deviceId)
    if (device) {
      await meeting.self.setDevice(device)
    }
  }, [meeting, videoDevices])

  const handleAudioDeviceChange = useCallback(async (deviceId: string) => {
    if (!meeting) return
    setSelectedAudioDevice(deviceId)
    const device = audioDevices.find((d) => d.deviceId === deviceId)
    if (device) {
      await meeting.self.setDevice(device)
    }
  }, [meeting, audioDevices])

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
        </div>

        {/* Video preview */}
        <div className="relative bg-[#212124] rounded-xl overflow-hidden aspect-video ring-1 ring-white/5">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ visibility: mediaReady && videoEnabled ? 'visible' : 'hidden' }}
          />
          {!mediaReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#212124]">
              <Loader2 className="h-8 w-8 animate-spin text-[#71717a]" />
            </div>
          )}
          {mediaReady && !videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#212124] to-[#161618]">
              <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-4xl font-semibold text-[#a1a1aa] select-none">
                  {(name || '?').charAt(0).toUpperCase()}
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
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              audioEnabled
                ? 'bg-[#60a5fa] text-white hover:bg-[#3b82f6]'
                : 'bg-[#212124] text-[#ef4444] hover:bg-[#2a2a2e] ring-1 ring-white/5'
            }`}
          >
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={toggleVideo}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              videoEnabled
                ? 'bg-[#60a5fa] text-white hover:bg-[#3b82f6]'
                : 'bg-[#212124] text-[#ef4444] hover:bg-[#2a2a2e] ring-1 ring-white/5'
            }`}
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
        </div>

        {/* Action area */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleJoin}
            disabled={isJoining || isWaiting}
            className="w-full h-12 rounded-lg bg-[#60a5fa] hover:bg-[#3b82f6] disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {isJoining || isWaiting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isJoining ? 'Joining...' : 'Waiting for host...'}
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

          {joinError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
              <p className="text-sm text-red-400">{joinError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
