import { useEffect, useRef, useState, useCallback } from 'react'
import { API_BASE } from '#/lib/api-client'
import { useAuthStore } from '#/features/auth/store/auth-store'

// ── WebSocket message types ──

export interface RoomStateCredentials {
  participant_id: string
  token: string
}

export interface RoomStateHost {
  id: number
  username: string
}

export interface RoomStateRoom {
  code: string
  name: string
  status: string
  meeting_id: string
  host: RoomStateHost
  max_members: number
  role_configuration: Record<string, unknown>
  scheduled_at: string | null
}

export interface RoomStateEvent {
  type: 'room_state'
  credentials: RoomStateCredentials
  room: RoomStateRoom
  members: unknown[]
  member_count: number
}

export type WsMessage = RoomStateEvent | { type: string; [key: string]: unknown }

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
  const [state, setState] = useState<WsState>('connecting')
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null)

  useEffect(() => {
    if (!code) return

    const token = useAuthStore.getState().accessToken
    const url = getWebSocketUrl(code, token)
    const ws = new WebSocket(url)

    ws.onopen = () => setState('open')
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

    return () => {
      ws.onopen = null
      ws.onclose = null
      ws.onerror = null
      ws.onmessage = null
      ws.close()
      wsRef.current = null
    }
  }, [code])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { state, lastMessage, send }
}
