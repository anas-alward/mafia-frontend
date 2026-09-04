import { useEffect } from 'react'
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { ConnectionState } from 'livekit-client'
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
    queueVersion,
    drainMessages,
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
  } = useRoomState(queueVersion, drainMessages)

  const authToken = roomState?.credentials.token ?? null
  const serverUrl = roomState?.credentials.server_url ?? null

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
      authToken,
      serverUrl,
      isReturningUser,
      participants,
      isHost,
    })
  })

  // Wire game store
  useEffect(() => {
    useGameStore.getState().setSend(send)
  }, [send])

  // Tear down the media session when leaving the room entirely (route
  // layout unmount). Child route transitions (join <-> live) do not hit this.
  useEffect(() => {
    return () => {
      const room = useMeetingStore.getState().room
      if (room && room.state === ConnectionState.Connected) {
        room.disconnect()
      }
      useMeetingStore.getState().setRoom(null)
    }
  }, [])

  if (roomClosed) {
    return <RoomClosedState />
  }

  return <Outlet />
}
