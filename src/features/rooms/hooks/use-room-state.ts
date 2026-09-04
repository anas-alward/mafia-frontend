import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { useGameStore } from '#/features/game/store/game-store'
import type {
  RoomStateEvent,
  PlayerJoinedEvent,
  PlayerLeftEvent,
  HostChangedEvent,
  ChatMessageEvent,
  JoinRequestReceivedEvent,
} from '../events'
import type { GameStateEvent } from '#/features/game/events'
import type { WsMessage } from './use-room-websocket'
import type { Participant } from '../types'

export interface ChatEntry {
  userId: number
  username: string
  message: string
}

export interface JoinRequest {
  userId: number
  username: string
}

export function useRoomState(
  queueVersion: number,
  drainMessages: () => WsMessage[],
) {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const [participants, setParticipants] = useState<Participant[]>([])
  const participantsRef = useRef<Participant[]>([])
  // Keep ref in sync so the join_request_received handler can read latest participants
  participantsRef.current = participants
  const [roomClosed, setRoomClosed] = useState(false)
  const [hostId, setHostId] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatEntry[]>([])
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])

  const [roomState, setRoomState] = useState<RoomStateEvent | null>(null)
  const [joinRequestStatus, setJoinRequestStatus] = useState<
    'idle' | 'requested' | 'accepted' | 'rejected'
  >('idle')

  const roomCode = roomState?.room_name ?? ''

  const isHost = useMemo(() => {
    if (hostId !== null && currentUser) return hostId === Number(currentUser.id)
    if (!roomState?.host_id || !currentUser) return false
    return roomState.host_id === Number(currentUser.id)
  }, [roomState, hostId, currentUser])

  // Process all queued messages — draining prevents loss when messages arrive
  // faster than React re-renders
  useEffect(() => {
    const messages = drainMessages()
    if (messages.length === 0) return

    for (const msg of messages) {
      if (msg.type === 'room_state') {
        setRoomState(msg as RoomStateEvent)
      }

      switch (msg.type) {
        case 'room_state': {
          const m = msg as RoomStateEvent
          if (m.host_id !== null) setHostId(m.host_id)
          setParticipants((prev) => {
            const existingIds = new Set(prev.map((p) => p.userId))
            const newParticipants: Participant[] = m.members
              .filter((id) => !existingIds.has(id))
              .map((id) => ({ userId: id, username: `Player ${id}` }))
            return newParticipants.length > 0
              ? [...prev, ...newParticipants]
              : prev
          })
          // Hydrate game store from the combined room_state payload (reconnection flow).
          // The embedded game_state lacks the `type` discriminator, so construct one.
          if (m.game_state) {
            useGameStore.getState().processMessage({
              type: 'game_state',
              ...m.game_state,
            })
          } else {
            useGameStore.getState().processMessage({
              type: 'game_state',
              session_id: null,
              current_phase: null,
            })
          }
          break
        }

        case 'player_joined': {
          const m = msg as PlayerJoinedEvent
          setParticipants((prev) => {
            if (prev.some((p) => p.userId === m.user_id)) {
              return prev.map((p) =>
                p.userId === m.user_id ? { ...p, username: m.username } : p,
              )
            }
            return [...prev, { userId: m.user_id, username: m.username }]
          })
          setJoinRequests((prev) => prev.filter((r) => r.userId !== m.user_id))
          break
        }

        case 'player_left': {
          const m = msg as PlayerLeftEvent
          setParticipants((prev) => prev.filter((p) => p.userId !== m.user_id))
          break
        }

        case 'host_changed': {
          const m = msg as HostChangedEvent
          setHostId(m.new_host_id)
          break
        }

        case 'room_closed': {
          setRoomClosed(true)
          const timer = setTimeout(() => navigate({ to: '/rooms' }), 3000)
          return () => clearTimeout(timer)
        }

        case 'chat_message': {
          const m = msg as ChatMessageEvent
          setChatMessages((prev) => [
            ...prev,
            { userId: m.user_id, username: m.username, message: m.message },
          ])
          break
        }

        case 'join_request_received': {
          const m = msg as JoinRequestReceivedEvent
          if (participantsRef.current.some((p) => p.userId === m.user_id)) break
          setJoinRequests((prev) => {
            if (prev.some((r) => r.userId === m.user_id)) return prev
            return [...prev, { userId: m.user_id, username: m.username }]
          })
          break
        }

        case 'join_request_accepted': {
          setJoinRequests((prev) =>
            prev.filter((r) => r.userId !== msg.user_id),
          )
          if (currentUser && msg.user_id === Number(currentUser.id)) {
            setJoinRequestStatus('accepted')
          }
          break
        }

        case 'join_request_rejected': {
          setJoinRequests((prev) =>
            prev.filter((r) => r.userId !== msg.user_id),
          )
          if (currentUser && msg.user_id === Number(currentUser.id)) {
            setJoinRequestStatus('rejected')
          }
          break
        }
      }
    }
  }, [queueVersion, drainMessages, navigate, currentUser])

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
    joinRequestStatus,
    setJoinRequestStatus,
    currentUser,
  }
}
