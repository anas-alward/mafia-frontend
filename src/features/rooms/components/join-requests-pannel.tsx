import { useCallback, useState } from 'react'

import { Check, X, Users } from 'lucide-react'

import { useJoinRequests } from '../hooks/use-join-requests'
import { useRoomContext } from '../context/room-context'

export default function JoinRequestsPanel() {
  const ctx = useRoomContext()
  const { joinRequests, acceptJoinRequest, rejectJoinRequest } = useJoinRequests({
    joinRequests: ctx.joinRequests,
    dismissJoinRequest: ctx.dismissJoinRequest,
    acceptJoinRequest: ctx.acceptJoinRequest,
    rejectJoinRequest: ctx.rejectJoinRequest,
  })
  const [open, setOpen] = useState(false)
  const count = joinRequests?.length ?? 0
  const toggle = useCallback(() => setOpen((p) => !p), [])

  return (
    <>
      {/* Toggle button - Stuck to right edge, vertical tab shape */}
      <button
        type="button"
        onClick={toggle}
        className="absolute top-1/2 -translate-y-1/2 right-0 z-20 flex flex-col items-center gap-3 px-2 py-4 rounded-l-xl bg-neutral-900 border-y border-l border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-500 transition-colors shadow-lg"
        aria-label="Toggle join requests panel"
      >
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium [writing-mode:vertical-rl] tracking-widest">
          Requests
        </span>
        {count > 0 && (
          <span className="text-[10px] bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full leading-none">
            {count}
          </span>
        )}
      </button>

      {/* Backdrop - Fades in/out smoothly */}
      <div
        onClick={toggle}
        className={`absolute inset-0 z-30 bg-black/50 transition-opacity duration-300 ease-in-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel - Slides in/out smoothly from the right */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-40 w-80 max-h-[80vh] bg-neutral-900 border-y border-l border-neutral-700 rounded-l-2xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header with Close Button */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-800">
          <Users className="h-5 w-5 text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-100">
            Join Requests
          </h3>
          {count > 0 && (
            <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}

          {/* X Close Button */}
          <button
            type="button"
            onClick={toggle}
            className="ml-auto p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {count === 0 ? (
            <p className="px-5 py-8 text-sm text-neutral-500 text-center">
              No pending requests
            </p>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {joinRequests!.map((req) => (
                <li
                  key={req.userId}
                  className="px-5 py-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-neutral-300">
                        {req.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-neutral-200 truncate">
                      {req.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => acceptJoinRequest(req.userId)}
                      className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
                      aria-label={`Accept ${req.username}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectJoinRequest(req.userId)}
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
  )
}
