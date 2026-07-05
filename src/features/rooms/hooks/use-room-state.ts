import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '#/features/auth/store/auth-store'
import type {
  RoomStateEvent,
  PlayerJoinedEvent,
  PlayerLeftEvent,
  HostChangedEvent,
  ChatMessageEvent,
  JoinRequestReceivedEvent,
} from '../events'
import type { WsMessage } from './use-room-websocket'
import type { Participant } from '../components/participant-list'

export interface ChatEntry {
  userId: number
  username: string
  message: string
}

export interface JoinRequest {
  userId: number
  username: string
}

export function useRoomState(lastMessage: WsMessage | null) {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [roomClosed, setRoomClosed] = useState(false)
  const [hostId, setHostId] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatEntry[]>([])
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])

  const [roomState, setRoomState] = useState<RoomStateEvent | null>(null)

  // Persist room_state across other events — only update when a new room_state arrives
  useEffect(() => {
    if (lastMessage?.type === 'room_state') {
      setRoomState(lastMessage as RoomStateEvent)
    }
  }, [lastMessage])

  const roomCode = roomState?.room_name ?? ''

  const isHost = useMemo(() => {
    if (hostId !== null && currentUser) return hostId === Number(currentUser.id)
    if (!roomState?.host_id || !currentUser) return false
    return roomState.host_id === Number(currentUser.id)
  }, [roomState, hostId, currentUser])

  useEffect(() => {
    if (!lastMessage) return

    switch (lastMessage.type) {
      case 'room_state': {
        const msg = lastMessage as RoomStateEvent
        if (msg.host_id !== null) setHostId(msg.host_id)
        break
      }

      case 'player_joined': {
        const msg = lastMessage as PlayerJoinedEvent
        setParticipants((prev) => {
          if (prev.some((p) => p.userId === msg.user_id)) {
            return prev.map((p) =>
              p.userId === msg.user_id ? { ...p, username: msg.username } : p,
            )
          }
          return [...prev, { userId: msg.user_id, username: msg.username }]
        })
        break
      }

      case 'player_left': {
        const msg = lastMessage as PlayerLeftEvent
        setParticipants((prev) => prev.filter((p) => p.userId !== msg.user_id))
        break
      }

      case 'host_changed': {
        const msg = lastMessage as HostChangedEvent
        setHostId(msg.new_host_id)
        break
      }

      case 'room_closed': {
        setRoomClosed(true)
        const timer = setTimeout(() => navigate({ to: '/rooms' }), 3000)
        return () => clearTimeout(timer)
      }

      case 'chat_message': {
        const msg = lastMessage as ChatMessageEvent
        setChatMessages((prev) => [
          ...prev,
          { userId: msg.user_id, username: msg.username, message: msg.message },
        ])
        break
      }

      case 'join_request_received': {
        const msg = lastMessage as JoinRequestReceivedEvent
        setJoinRequests((prev) => {
          if (prev.some((r) => r.userId === msg.user_id)) return prev
          return [...prev, { userId: msg.user_id, username: msg.username }]
        })
        break
      }

      case 'join_request_accepted': {
        setJoinRequests((prev) =>
          prev.filter((r) => r.userId !== lastMessage.user_id),
        )
        break
      }

      case 'join_request_rejected': {
        setJoinRequests((prev) =>
          prev.filter((r) => r.userId !== lastMessage.user_id),
        )
        break
      }
    }
  }, [lastMessage, navigate])

  const dismissJoinRequest = useCallback((userId: number) => {
    setJoinRequests((prev) => prev.filter((r) => r.userId !== userId))
  }, [])

  return {
    roomState,
    roomCode,
    isHost,
    hostId,
    participants,
    roomClosed,
    chatMessages,
    joinRequests,
    dismissJoinRequest,
    currentUser,
  }
}
