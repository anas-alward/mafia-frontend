import { useEffect, useRef, useState } from 'react'
import {
  useRealtimeKitClient,
  useRealtimeKitMeeting,
  useRealtimeKitSelector,
  RealtimeKitProvider,
} from '@cloudflare/realtimekit-react'
import {
  RtkUiProvider,
  RtkStage,
  RtkGridPagination,
  RtkParticipantCount,
  RtkViewerCount,
  RtkFullscreenToggle,
  RtkMicToggle,
  RtkCameraToggle,
  RtkStageToggle,
  RtkLeaveButton,
  RtkSetupScreen,
  RtkWaitingScreen,
  RtkEndedScreen,
  RtkParticipantsAudio,
  RtkDialogManager,
  RtkNotifications,
  RtkNameTag,
  RtkAudioVisualizer,
} from '@cloudflare/realtimekit-react-ui'
import type { States } from '@cloudflare/realtimekit-react-ui'
import JoinRequestsPanel from '#/features/rooms/components/join-requests-pannel.tsx'
import type { RoomStateEvent } from '../events'
import type { JoinRequest } from '../hooks/use-room-state'

interface MeetingRoomProps {
  roomState: RoomStateEvent | null
  joinRequests?: JoinRequest[]
  onAcceptJoinRequest?: (userId: number) => void
  onRejectJoinRequest?: (userId: number) => void
}

// ─────────────────────────────────────────────────────────────
// CUSTOM PARTICIPANT TILE
// Bypasses RtkParticipantTile's internal (shadow-DOM, size-token
// based) video sizing so we can fully control fill/stretch via
// a plain <video> element registered directly with the SDK.
// ─────────────────────────────────────────────────────────────
interface CustomParticipantTileProps {
  participant: any // RTKSelf | RTKParticipant
}

function CustomParticipantTile({ participant }: CustomParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoEnabled = useRealtimeKitSelector(() => participant.videoEnabled)
  const videoTrack = useRealtimeKitSelector(() => participant.videoTrack)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !participant) return

    participant.registerVideoElement(el)
    return () => {
      participant.deregisterVideoElement(el)
    }
  }, [participant, videoTrack])

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-neutral-700 shadow-lg bg-neutral-900 transition-all hover:border-blue-500">
      {videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-3xl font-medium">
          {participant.name?.[0]?.toUpperCase() ?? '?'}
        </div>
      )}

      <div className="absolute bottom-2 left-2">
        <RtkNameTag participant={participant}>
          <RtkAudioVisualizer />
        </RtkNameTag>
      </div>
    </div>
  )
}

function MeetingRoomInner({
  joinRequests,
  onAcceptJoinRequest,
  onRejectJoinRequest,
}: {
  joinRequests?: JoinRequest[]
  onAcceptJoinRequest?: (userId: number) => void
  onRejectJoinRequest?: (userId: number) => void
}) {
  const { meeting } = useRealtimeKitMeeting()
  const [currentState, setCurrentState] = useState('idle')
  const [uiStates, setUiStates] = useState<States | null>(null)

  const fullScreenRef = useRef<HTMLDivElement>(null)

  const handleStatesUpdate = (event: { detail: States }) => {
    setUiStates(event.detail)
    const meetingState = event.detail.meeting

    if (meetingState === 'idle' && currentState !== 'idle')
      setCurrentState('idle')
    else if (meetingState === 'setup' && currentState !== 'setup')
      setCurrentState('setup')
    else if (meetingState === 'waiting' && currentState !== 'waiting')
      setCurrentState('waiting')
    else if (meetingState === 'joined' && currentState !== 'joined')
      setCurrentState('joined')
    else if (meetingState === 'ended' && currentState !== 'ended')
      setCurrentState('ended')
  }

  const localParticipant = meeting.self
  const remoteParticipants = meeting.participants.joined.toArray()
  const allParticipants = [localParticipant, ...remoteParticipants]

  // ✅ DYNAMIC GRID CALCULATION
  // Adjusts the number of columns based on how many people are in the call
  const getGridCols = (count: number) => {
    if (count <= 1) return 'grid-cols-1'
    if (count <= 4) return 'grid-cols-2'
    if (count <= 9) return 'grid-cols-3'
    return 'grid-cols-4'
  }

  const gridColsClass = getGridCols(allParticipants.length)

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-white">
      <RtkUiProvider
        ref={fullScreenRef}
        meeting={meeting}
        showSetupScreen={true}
        onRtkStatesUpdate={handleStatesUpdate}
        className={'bg-neutral-800'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          margin: 0,
        }}
      >
        <div
          id="meeting-container"
          className="flex flex-col flex-1 h-full w-full"
        >
          {currentState === 'idle' && (
            <div className="flex items-center justify-center h-full text-neutral-500">
              Meeting is loading...
            </div>
          )}
          {currentState === 'setup' && <RtkSetupScreen />}
          {currentState === 'waiting' && <RtkWaitingScreen />}

          {currentState === 'joined' && uiStates && (
            <>
              <RtkStage
                style={{
                  flex: 1,
                  flexGrow: 1,
                  flexShrink: 1,
                  position: 'relative',
                }}
              >
                <div
                  className={'m-3 rounded-2xl p-2'}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: 'white',
                  }}
                >
                  <div
                    id="header-right"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: '48px',
                      gap: '12px',
                    }}
                  >
                    <RtkGridPagination />
                    <RtkParticipantCount />
                    <RtkViewerCount />
                  </div>
                </div>

                {/* --- DYNAMIC CUSTOM PARTICIPANT GRID --- */}
                <div
                  className={`grid ${gridColsClass} gap-2 p-2 h-[80%] w-full`}
                >
                  {allParticipants.map((participant) => (
                    <CustomParticipantTile
                      key={
                        participant.id ||
                        participant.userId ||
                        'local-participant'
                      }
                      participant={participant}
                    />
                  ))}
                </div>
                {/* ----------------------------------------- */}
              </RtkStage>
              <JoinRequestsPanel
                joinRequests={joinRequests}
                onAcceptJoinRequest={onAcceptJoinRequest}
                onRejectJoinRequest={onRejectJoinRequest}
              />

              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  padding: '8px 12px',
                  color: 'white',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  id="controlbar-left"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RtkFullscreenToggle targetElement={fullScreenRef.current} />
                </div>
                <div
                  id="controlbar-center"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                  }}
                >
                  <RtkMicToggle />
                  <RtkCameraToggle />
                  <RtkStageToggle />
                  <RtkLeaveButton />
                </div>
              </div>
            </>
          )}

          {currentState === 'ended' && <RtkEndedScreen />}
        </div>

        <RtkParticipantsAudio />
        <RtkDialogManager />
        <RtkNotifications />
      </RtkUiProvider>
    </div>
  )
}

export function MeetingRoom(props: MeetingRoomProps) {
  const [meeting, initMeeting] = useRealtimeKitClient()
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    if (!props.roomState?.credentials) return
    if (meeting) return

    initMeeting({ authToken: props.roomState.credentials.token })
      .then((result) => {
        if (!result) return
      })
      .catch((err: unknown) => {
        setInitError(
          err instanceof Error ? err.message : 'Failed to connect to meeting.',
        )
      })
  }, [props.roomState?.credentials.token, meeting, initMeeting])

  if (initError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{initError}</p>
      </div>
    )
  }

  if (!props.roomState?.credentials) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-500">Waiting for room credentials...</p>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-500">Connecting to meeting...</p>
      </div>
    )
  }

  return (
    <RealtimeKitProvider value={meeting}>
      <MeetingRoomInner
        joinRequests={props.joinRequests}
        onAcceptJoinRequest={props.onAcceptJoinRequest}
        onRejectJoinRequest={props.onRejectJoinRequest}
      />
    </RealtimeKitProvider>
  )
}
