import { useState, useEffect } from 'react'
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useRealtimeKitClient } from '@cloudflare/realtimekit-react'
import type RTKClient from '@cloudflare/realtimekit'
import { useRoomWebSocket } from '#/features/rooms/hooks/use-room-websocket'
import { useRoomState } from '#/features/rooms/hooks/use-room-state'
import { RoomClosedState } from '#/features/rooms/states/room-closed-state'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useGameStore } from '#/features/game/store/game-store'

export const Route = createFileRoute('/rooms/$roomId')({
  beforeLoad: ({ location, params }) => {
    // Redirect /rooms/$roomId to /rooms/$roomId/join
    const exactRoomPath = `/rooms/${params.roomId}`
    if (location.pathname === exactRoomPath) {
      throw redirect({
        to: '/rooms/$roomId/join',
        params: { roomId: params.roomId },
      })
    }
  },
  component: RoomLayout,
})

function RoomLayout() {
  const { roomId } = Route.useParams()
  const {
    state: wsState,
    lastMessage,
    send,
    reconnect,
    sendError,
    acceptJoinRequest,
    rejectJoinRequest,
    sendJoinRequest,
  } = useRoomWebSocket(roomId, useGameStore.getState().processMessage)
  const {
    roomState,
    roomClosed,
    joinRequests,
    dismissJoinRequest,
    joinRequestStatus,
    setJoinRequestStatus,
    currentUser,
    participants,
    isHost,
  } = useRoomState(lastMessage)

  const [meeting, initMeeting] = useRealtimeKitClient()
  const [meetingInstance, setMeetingInstance] = useState<RTKClient | null>(null)

  const authToken = roomState?.credentials.token ?? null

  const isReturningUser =
    currentUser && roomState?.members
      ? roomState.members.includes(Number(currentUser.id))
      : false

  // Sync meeting store
  useEffect(() => {
    useMeetingStore.setState({
      roomId,
      wsState,
      sendError,
      reconnect,
      sendJoinRequest,
      roomState,
      joinRequests,
      dismissJoinRequest,
      acceptJoinRequest,
      rejectJoinRequest,
      joinRequestStatus,
      setJoinRequestStatus,
      meeting,
      initMeeting,
      meetingInstance,
      setMeetingInstance,
      authToken,
      isReturningUser,
      participants,
      isHost,
    })
  })

  // Wire game store
  useEffect(() => {
    useGameStore.getState().setSend(send)
  }, [send])


  if (roomClosed) {
    return <RoomClosedState />
  }

  return <Outlet />
}
