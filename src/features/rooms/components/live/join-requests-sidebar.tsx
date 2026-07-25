import { Users, Check, X } from 'lucide-react'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useJoinRequests } from '#/features/rooms/hooks/use-join-requests'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '#/components/ui/sidebar'

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

  return (
    <Sidebar
      side="right"
      collapsible="offcanvas"
      className="border-l border-white/5 bg-[#1a1a1d]"
    >
      <SidebarHeader className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#a1a1aa]" />
          <h2 className="text-sm font-semibold text-[#f4f4f5]">Join Requests</h2>
          {count > 0 && (
            <span className="text-xs text-[#a1a1aa] bg-white/5 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="[&>[data-sidebar=menu]]:flex-1">
        <SidebarGroup>
          <SidebarGroupContent>
            {count === 0 ? (
              <p className="px-2 py-8 text-sm text-[#71717a] text-center">
                No pending requests
              </p>
            ) : (
              <SidebarMenu>
                {joinRequests.map((req) => (
                  <SidebarMenuItem key={req.userId}>
                    <div className="flex items-center justify-between gap-3 px-2 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-[#a1a1aa]">
                            {req.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-[#f4f4f5] truncate">
                          {req.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => acceptJoinRequest(req.userId)}
                          className="p-1.5 rounded-lg bg-green-600/80 text-white hover:bg-green-500 transition-colors"
                          aria-label={`Accept ${req.username}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectJoinRequest(req.userId)}
                          className="p-1.5 rounded-lg bg-white/5 text-[#a1a1aa] hover:bg-white/10 hover:text-[#f4f4f5] transition-colors"
                          aria-label={`Reject ${req.username}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
