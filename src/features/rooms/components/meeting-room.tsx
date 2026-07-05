import { useCallback, useEffect, useState } from 'react'
import {
  useRealtimeKitClient,
  useRealtimeKitMeeting,
  RealtimeKitProvider,
} from '@cloudflare/realtimekit-react'
import { RtkMeeting } from '@cloudflare/realtimekit-react-ui'
import { Check, X, Users } from 'lucide-react'
import type { RoomStateEvent } from '../events'
import type { JoinRequest } from '../hooks/use-room-state'

interface MeetingRoomProps {
  roomState: RoomStateEvent | null
  joinRequests?: JoinRequest[]
  onAcceptJoinRequest?: (userId: number) => void
  onRejectJoinRequest?: (userId: number) => void
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
  const [open, setOpen] = useState(false)
  const count = joinRequests?.length ?? 0

  const toggle = useCallback(() => setOpen((p) => !p), [])

  return (
    <div className="flex flex-col h-full relative">
      <RtkMeeting
        mode="fill"
        meeting={meeting}
        showSetupScreen={true}
      />

      {/* Toggle button */}
      <button
        type="button"
        onClick={toggle}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:border-neutral-500 transition-colors shadow-lg"
      >
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">Requests</span>
        {count > 0 && (
          <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center leading-none">
            {count}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="absolute inset-0 z-30 bg-black/50" onClick={toggle} />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-80 max-h-[60vh] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-800">
              <Users className="h-5 w-5 text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-100">Join Requests</h3>
              {count > 0 && (
                <span className="ml-auto text-xs text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {count === 0 ? (
                <p className="px-5 py-8 text-sm text-neutral-500 text-center">No pending requests</p>
              ) : (
                <ul className="divide-y divide-neutral-800">
                  {joinRequests!.map((req) => (
                    <li key={req.userId} className="px-5 py-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-neutral-300">
                            {req.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-neutral-200 truncate">{req.username}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onAcceptJoinRequest?.(req.userId)}
                          className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
                          aria-label={`Accept ${req.username}`}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectJoinRequest?.(req.userId)}
                          className="p-2 rounded-lg bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors"
                          aria-label={`Reject ${req.username}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function MeetingRoom(props: MeetingRoomProps) {
  const [meeting, initMeeting] = useRealtimeKitClient()
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- roomState may not have credentials at runtime
    if (!props.roomState?.credentials?.token) return
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- meeting is undefined before initMeeting resolves
    if (meeting) return

    initMeeting({ authToken: props.roomState.credentials.token })
      .then((result) => {
        if (!result) return // init already in-flight (StrictMode double-fire)
      })
      .catch((err: unknown) => {
        setInitError(err instanceof Error ? err.message : 'Failed to connect to meeting.')
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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- meeting is undefined at runtime before init
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
