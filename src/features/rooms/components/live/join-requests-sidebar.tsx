import { Users, Check, X } from 'lucide-react'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useJoinRequests } from '#/features/rooms/hooks/use-join-requests'
import { useSidebar } from '#/components/ui/sidebar'

export function JoinRequestsSidebar() {
  const roomJoinRequests = useMeetingStore((s) => s.joinRequests)
  const roomDismissJoinRequest = useMeetingStore((s) => s.dismissJoinRequest)
  const roomAcceptJoinRequest = useMeetingStore((s) => s.acceptJoinRequest)
  const roomRejectJoinRequest = useMeetingStore((s) => s.rejectJoinRequest)
  const { joinRequests, acceptJoinRequest, rejectJoinRequest } = useJoinRequests({
    joinRequests: roomJoinRequests,
    dismissJoinRequest: roomDismissJoinRequest,
    acceptJoinRequest: roomAcceptJoinRequest,
    rejectJoinRequest: roomRejectJoinRequest,
  })
  const count = joinRequests.length
  const { open, setOpen } = useSidebar()

  return (
    <aside
      className={`fixed right-4 top-20 bottom-24 z-10 w-72 bg-[#1c1c1f] border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ease-out ${
        open
          ? 'translate-x-0 opacity-100'
          : 'translate-x-[calc(100%+1rem)] opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <Users className="h-4 w-4 text-[#a1a1aa]" />
          <h2 className="text-sm font-medium text-[#f4f4f5]">Join Requests</h2>
          {count > 0 && (
            <span className="text-[11px] font-medium text-[#a1a1aa] bg-white/[0.06] px-1.5 py-px rounded-full leading-relaxed">
              {count}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-full text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.06] transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {count === 0 ? (
          <p className="px-5 py-12 text-[13px] text-[#71717a] text-center">
            No pending requests
          </p>
        ) : (
          <ul className="flex flex-col">
            {joinRequests.map((req) => (
              <li key={req.userId}>
                <div className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                      <span className="text-[13px] font-medium text-[#d4d4d8]">
                        {req.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[13px] text-[#f4f4f5] truncate">
                      {req.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => acceptJoinRequest(req.userId)}
                      className="p-2 rounded-full text-[#a1a1aa] hover:text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors"
                      aria-label={`Accept ${req.username}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectJoinRequest(req.userId)}
                      className="p-2 rounded-full text-[#a1a1aa] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                      aria-label={`Reject ${req.username}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
