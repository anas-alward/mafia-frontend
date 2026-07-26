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
  GameStartedEvent,
  RoleAssignedEvent,
  SunRiseEvent,
  SunSetEvent,
  VoteCastEvent,
  VoteResultStartedEvent,
  GameStateEvent,
  GameResetEvent,
  GameCanceledEvent,
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
  | GameStartedEvent
  | RoleAssignedEvent
  | SunRiseEvent
  | SunSetEvent
  | VoteCastEvent
  | VoteResultStartedEvent
  | GameStateEvent
  | GameResetEvent
  | GameCanceledEvent
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
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const mountedRef = useRef(true)
  const [state, setState] = useState<WsState>('connecting')
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null)
  const [wasEverOpen, setWasEverOpen] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const connect = useCallback(() => {
    if (!code) return

    const token = useAuthStore.getState().accessToken
    const url = getWebSocketUrl(code, token)
    const ws = new WebSocket(url)

    ws.onopen = () => {
      if (!mountedRef.current) return
      setState('open')
      setSendError(null)
      if (!wasEverOpenRef.current) {
        wasEverOpenRef.current = true
        setWasEverOpen(true)
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setState('closed')
      // Auto-reconnect after 2s if the socket was ever open
      if (wasEverOpenRef.current) {
        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connect()
          }
        }, 2000)
      }
    }

    ws.onerror = () => {
      if (!mountedRef.current) return
      setState('error')
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return
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
    mountedRef.current = true
    wasEverOpenRef.current = false
    setWasEverOpen(false)
    connect()

    return () => {
      mountedRef.current = false
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
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
    const readyState = wsRef.current?.readyState
    if (readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
      setSendError(null)
    } else {
      const msg = `Connection lost — cannot send. State: ${readyState === WebSocket.CONNECTING ? 'connecting' : readyState === WebSocket.CLOSING ? 'closing' : 'closed'}`
      console.warn('[WS send]', msg)
      setSendError(msg)
    }
  }, [])

  const reconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
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

  const sendJoinRequest = useCallback(
    () => send({ type: 'join_request', room_code: code }),
    [send, code],
  )

  return { state, lastMessage, send, reconnect, wasEverOpen, sendError, acceptJoinRequest, rejectJoinRequest, closeRoom, sendJoinRequest }
}
