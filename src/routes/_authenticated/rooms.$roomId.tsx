import { useEffect, useRef, useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { RTKClient } from '@cloudflare/realtimekit'
import {
  useRealtimeKitClient,
  RealtimeKitProvider,
} from '@cloudflare/realtimekit-react'
import {
  RtkUiProvider,
  RtkParticipantsAudio,
  RtkDialogManager,
  RtkNotifications,
} from '@cloudflare/realtimekit-react-ui'
import { useRoomWebSocket } from '#/features/rooms/hooks/use-room-websocket'
import { useRoomState } from '#/features/rooms/hooks/use-room-state'
import { RoomClosedState } from '#/features/rooms/states/room-closed-state'
import { RoomActiveState } from '#/features/rooms/states/room-active-state'
import { MeetingSetupState } from '#/features/rooms/states/meeting-setup-state'
import { MeetingEndedState } from '#/features/rooms/states/meeting-ended-state'
import { RoomContextProvider } from '#/features/rooms/context/room-context'

export const Route = createFileRoute('/_authenticated/rooms/$roomId')({
  component: MeetingRoomPage,
})

function MeetingRoomPage() {
  const { roomId } = Route.useParams()
  const {
    state: wsState,
    lastMessage,
    reconnect,
    wasEverOpen,
    acceptJoinRequest,
    rejectJoinRequest,
    sendJoinRequest,
  } = useRoomWebSocket(roomId)
  const {
    roomState,
    roomClosed,
    joinRequests,
    dismissJoinRequest,
    joinRequestStatus,
    setJoinRequestStatus,
    currentUser,
  } = useRoomState(lastMessage)

  const [meeting, initMeeting] = useRealtimeKitClient()
  const [meetingInstance, setMeetingInstance] = useState<RTKClient | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [meetingState, setMeetingState] = useState('idle')
  const fullScreenRef = useRef<HTMLDivElement>(null)

  const isReturningUser =
    currentUser && roomState?.members
      ? roomState.members.includes(Number(currentUser.id))
      : false

  const authToken = roomState?.credentials.token ?? null

  // For new users: when host accepts join request AND we have credentials, init + join
  useEffect(() => {
    if (joinRequestStatus !== 'accepted' || !authToken || meetingInstance || initError) return

    initMeeting({ authToken })
      .then((result) => {
        if (result) {
          setMeetingInstance(result)
          return result.join()
        }
      })
      .then(() => {
        setMeetingState('joined')
      })
      .catch((err: unknown) => {
        setInitError(
          err instanceof Error ? err.message : 'Failed to connect to meeting.',
        )
      })
  }, [joinRequestStatus, authToken, meetingInstance, initError, initMeeting])

  const handleJoin = useCallback(async () => {
    console.log('[handleJoin] CALLED', {
      isReturningUser,
      wasEverOpen,
      branch: isReturningUser ? 'returning' : 'new',
      authToken: authToken ? `${authToken.slice(0, 20)}...` : null,
      joinRequestStatus,
      meetingState,
      hasMeeting: !!meeting,
    })
    setInitError(null)

    if (isReturningUser || wasEverOpen) {
      if (!authToken) {
        console.log('[handleJoin] EXIT early — no authToken')
        return
      }
      try {
        console.log('[handleJoin] calling initMeeting with authToken...')
        const result = await initMeeting({ authToken })
        console.log('[handleJoin] initMeeting returned:', result)
        if (result) {
          console.log('[handleJoin] saving meeting instance, then joining...')
          setMeetingInstance(result)
          await result.join()
          console.log('[handleJoin] join() succeeded, setting meetingState=joined')
          setMeetingState('joined')
        } else {
          console.log('[handleJoin] initMeeting returned FALSY — doing nothing')
        }
      } catch (err: unknown) {
        console.error('[handleJoin] ERROR:', err)
        setInitError(
          err instanceof Error ? err.message : 'Failed to connect to meeting.',
        )
      }
    } else {
      console.log('[handleJoin] sending join request...')
      setJoinRequestStatus('requested')
      sendJoinRequest()
    }
  }, [authToken, isReturningUser, wasEverOpen, initMeeting, sendJoinRequest, setJoinRequestStatus, joinRequestStatus, meetingState, meeting])

  const handleStatesUpdate = (event: { detail: { meeting?: string } }) => {
    const state = event.detail.meeting
    console.log('[handleStatesUpdate] RTK fired:', state)

    // Only react to terminal states from RTK — never override our
    // page-level routing with RTK's internal lifecycle (idle/setup/waiting).
    if (state === 'ended') {
      setMeetingState('ended')
    }
  }

  // ── Room closed ──
  if (roomClosed) {
    return <RoomClosedState />
  }

  // ── RTK init error ──
  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#161618]">
        <div className="text-center space-y-4">
          <p className="text-red-400">{initError}</p>
          <button
            type="button"
            onClick={() => {
              setInitError(null)
              setJoinRequestStatus('idle')
            }}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#f4f4f5] text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // ── Joined ──
  const activeMeeting = meetingInstance || meeting
  if (meetingState === 'joined' && activeMeeting) {
    const roomContextValue = {
      joinRequests,
      dismissJoinRequest,
      acceptJoinRequest,
      rejectJoinRequest,
    }

    return (
      <div className="flex flex-col h-screen bg-[#161618]">
        <RealtimeKitProvider value={activeMeeting}>
          <RoomContextProvider value={roomContextValue}>
            <RtkUiProvider
              ref={fullScreenRef}
              meeting={activeMeeting}
              showSetupScreen={false}
              onRtkStatesUpdate={handleStatesUpdate}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                margin: 0,
              }}
            >
              <RoomActiveState fullScreenRef={fullScreenRef} roomId={roomId} />
              <RtkParticipantsAudio />
              <RtkDialogManager />
              <RtkNotifications />
            </RtkUiProvider>
          </RoomContextProvider>
        </RealtimeKitProvider>
      </div>
    )
  }

  // ── Meeting ended ──
  if (meetingState === 'ended') {
    return <MeetingEndedState />
  }

  console.log('[RENDER] setup state', {
    isReturningUser,
    wasEverOpen,
    isReturningUserProp: isReturningUser || wasEverOpen,
    hasAuthToken: !!authToken,
    joinRequestStatus,
    wsState,
    meetingState,
    hasMeeting: !!meeting,
  })

  // ── Setup page ──
  return (
    <div className="h-screen bg-[#161618]">
      <MeetingSetupState
        roomId={roomId}
        isReturningUser={isReturningUser || wasEverOpen}
        joinRequestStatus={joinRequestStatus}
        wsState={wsState}
        onReconnect={reconnect}
        authToken={authToken}
        onJoin={handleJoin}
      />
    </div>
  )
}
