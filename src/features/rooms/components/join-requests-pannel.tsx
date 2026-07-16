import { Check, X, Users } from 'lucide-react'
import { useJoinRequests } from '../hooks/use-join-requests'
import { useRoomContext } from '../context/room-context'

interface JoinRequestsPanelProps {
  open: boolean
  onToggle: () => void
}

export default function JoinRequestsPanel({ open, onToggle }: JoinRequestsPanelProps) {
  const ctx = useRoomContext()
  const { joinRequests, acceptJoinRequest, rejectJoinRequest } = useJoinRequests({
    joinRequests: ctx.joinRequests,
    dismissJoinRequest: ctx.dismissJoinRequest,
    acceptJoinRequest: ctx.acceptJoinRequest,
    rejectJoinRequest: ctx.rejectJoinRequest,
  })
  const count = joinRequests?.length ?? 0

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onToggle}
        className={`absolute inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-40 w-80 max-h-[80vh] bg-[#212124] border-y border-l border-white/5 rounded-l-2xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
          <Users className="h-5 w-5 text-[#a1a1aa]" />
          <h3 className="text-sm font-semibold text-[#f4f4f5]">
            Join Requests
          </h3>
          {count > 0 && (
            <span className="text-xs text-[#a1a1aa] bg-white/5 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}

          <button
            type="button"
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/5 transition-colors"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {count === 0 ? (
            <p className="px-5 py-8 text-sm text-[#71717a] text-center">
              No pending requests
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {joinRequests!.map((req) => (
                <li
                  key={req.userId}
                  className="px-5 py-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-[#a1a1aa]">
                        {req.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-[#f4f4f5] truncate">
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
                      className="p-2 rounded-lg bg-white/5 text-[#a1a1aa] hover:bg-white/10 hover:text-[#f4f4f5] transition-colors"
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
