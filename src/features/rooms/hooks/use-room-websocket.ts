import { useEffect, useRef, useState, useCallback } from 'react'
import { API_BASE } from '#/lib/api-client'
import { useAuthStore } from '#/features/auth/store/auth-store'
import type {
  RoomStateEvent,
  PlayerJoinedEvent,
  PlayerLeftEvent,
  HostChangedEvent,
  RoomClosedEvent,
  ChatMessageEvent,
  JoinRequestReceivedEvent,
  JoinRequestAcceptedEvent,
  JoinRequestRejectedEvent,
} from '../events'

// ── WebSocket message union ──

export type WsMessage =
  | RoomStateEvent
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | HostChangedEvent
  | RoomClosedEvent
  | ChatMessageEvent
  | JoinRequestReceivedEvent
  | JoinRequestAcceptedEvent
  | JoinRequestRejectedEvent
  | { type: string; [key: string]: unknown }

export type WsState = 'connecting' | 'open' | 'closed' | 'error'

function getWebSocketUrl(code: string, token: string | null): string {
  const url = new URL(API_BASE)
  const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${url.host}/ws/room/${code}/`
  if (token) {
    return `${wsUrl}?token=${encodeURIComponent(token)}`
  }
  return wsUrl
}

export function useRoomWebSocket(code: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null)
  const wasEverOpenRef = useRef(false)
  const [state, setState] = useState<WsState>('connecting')
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null)
  const [wasEverOpen, setWasEverOpen] = useState(false)

  const connect = useCallback(() => {
    if (!code) return

    const token = useAuthStore.getState().accessToken
    const url = getWebSocketUrl(code, token)
    const ws = new WebSocket(url)

    ws.onopen = () => {
      setState('open')
      if (!wasEverOpenRef.current) {
        wasEverOpenRef.current = true
        setWasEverOpen(true)
      }
    }

    ws.onclose = () => setState('closed')
    ws.onerror = () => setState('error')

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsMessage
        setLastMessage(data)
      } catch {
        // Ignore non-JSON messages
      }
    }

    wsRef.current = ws
  }, [code])

  useEffect(() => {
    wasEverOpenRef.current = false
    setWasEverOpen(false)
    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.onopen = null
        wsRef.current.onclose = null
        wsRef.current.onerror = null
        wsRef.current.onmessage = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onopen = null
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      wsRef.current.close()
      wsRef.current = null
    }
    setState('connecting')
    connect()
  }, [connect])

  const acceptJoinRequest = useCallback(
    (userId: number) => send({ type: 'accept_join_request', user_id: userId }),
    [send],
  )

  const rejectJoinRequest = useCallback(
    (userId: number) => send({ type: 'reject_join_request', user_id: userId }),
    [send],
  )

  const closeRoom = useCallback(() => send({ type: 'close_room' }), [send])

  return { state, lastMessage, send, reconnect, wasEverOpen, acceptJoinRequest, rejectJoinRequest, closeRoom }
}
