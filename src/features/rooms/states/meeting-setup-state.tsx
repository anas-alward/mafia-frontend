import { useState, useRef, useEffect, useCallback } from 'react'
import { useRealtimeKitMeeting, useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import { Button } from '#/components/ui/button'
import { Mic, MicOff, Video, VideoOff, LogIn, Loader2, ChevronDown } from 'lucide-react'

export function MeetingSetupState() {
  const { meeting } = useRealtimeKitMeeting()

  const name = useRealtimeKitSelector(() => meeting.self.name)
  const videoEnabled = useRealtimeKitSelector(() => meeting.self.videoEnabled)
  const audioEnabled = useRealtimeKitSelector(() => meeting.self.audioEnabled)

  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [mediaReady, setMediaReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const initializedRef = useRef(false)

  // Initialize media tracks on mount
  useEffect(() => {
    if (initializedRef.current) return
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

  // Register video element for preview
  useEffect(() => {
    const el = videoRef.current
    if (!el || !meeting) return
    meeting.self.registerVideoElement(el, true)
    return () => { meeting.self.deregisterVideoElement(el, true) }
  }, [meeting])

  const handleJoin = useCallback(async () => {
    setJoinError(null)
    setIsJoining(true)
    try {
      await meeting.join()
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join meeting')
      setIsJoining(false)
    }
  }, [meeting])

  const toggleAudio = useCallback(() => {
    if (audioEnabled) meeting.self.disableAudio()
    else meeting.self.enableAudio()
  }, [meeting, audioEnabled])

  const toggleVideo = useCallback(() => {
    if (videoEnabled) meeting.self.disableVideo()
    else meeting.self.enableVideo()
  }, [meeting, videoEnabled])

  const handleVideoDeviceChange = useCallback(async (deviceId: string) => {
    setSelectedVideoDevice(deviceId)
    const device = videoDevices.find((d) => d.deviceId === deviceId)
    if (device) {
      await meeting.self.setDevice(device)
    }
  }, [meeting, videoDevices])

  const handleAudioDeviceChange = useCallback(async (deviceId: string) => {
    setSelectedAudioDevice(deviceId)
    const device = audioDevices.find((d) => d.deviceId === deviceId)
    if (device) {
      await meeting.self.setDevice(device)
    }
  }, [meeting, audioDevices])

  return (
    <div className="flex items-center justify-center h-full bg-white">
      <div className="w-full max-w-lg mx-auto px-6 py-10 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-neutral-900">Ready to join?</h2>
          <p className="text-sm text-neutral-500">Set up your audio and video before joining</p>
        </div>

        {/* Video preview — <video> always in DOM so registerVideoElement can attach */}
        <div className="relative bg-neutral-100 rounded-xl overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ visibility: mediaReady && videoEnabled ? 'visible' : 'hidden' }}
          />
          {!mediaReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
            </div>
          )}
          {mediaReady && !videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
              <div className="h-20 w-20 rounded-full bg-neutral-200 flex items-center justify-center">
                <span className="text-4xl font-semibold text-neutral-400 select-none">
                  {(name || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Device selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Camera</label>
            <div className="relative">
              <select
                value={selectedVideoDevice}
                onChange={(e) => handleVideoDeviceChange(e.target.value)}
                className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-3 pr-8 text-sm text-neutral-700 appearance-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
              >
                {videoDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Microphone</label>
            <div className="relative">
              <select
                value={selectedAudioDevice}
                onChange={(e) => handleAudioDeviceChange(e.target.value)}
                className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-3 pr-8 text-sm text-neutral-700 appearance-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
              >
                {audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Mic ${d.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* Media toggles */}
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant={audioEnabled ? 'default' : 'outline'}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleAudio}
          >
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button
            type="button"
            variant={videoEnabled ? 'default' : 'outline'}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleVideo}
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
        </div>

        {/* Join button */}
        <div className="space-y-2">
          <Button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full h-12 text-base"
          >
            {isJoining ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <LogIn className="h-5 w-5 mr-2" />
            )}
            {isJoining ? 'Joining...' : 'Join meeting'}
          </Button>
          {joinError && (
            <p className="text-sm text-red-500 text-center">{joinError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
