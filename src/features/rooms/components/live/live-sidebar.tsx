import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { Users, ScrollText, X, Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useJoinRequests } from '#/features/rooms/hooks/use-join-requests'
import { GameLog } from '#/features/game/components/game-log'

type SidebarTab = 'log' | 'requests' | null

interface LiveSidebarContextValue {
  activeTab: SidebarTab
  openTab: (tab: SidebarTab) => void
  close: () => void
  toggle: (tab: SidebarTab) => void
}

const LiveSidebarContext = createContext<LiveSidebarContextValue | null>(null)

export function useLiveSidebar() {
  const ctx = useContext(LiveSidebarContext)
  if (!ctx) throw new Error('useLiveSidebar must be used within <LiveSidebar>')
  return ctx
}

export function LiveSidebar({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>(null)

  const openTab = (tab: SidebarTab) => setActiveTab(tab)
  const close = () => setActiveTab(null)
  const toggle = (tab: SidebarTab) =>
    setActiveTab((prev) => (prev === tab ? null : tab))

  return (
    <LiveSidebarContext.Provider value={{ activeTab, openTab, close, toggle }}>
      {children}
    </LiveSidebarContext.Provider>
  )
}

function LogToggle() {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const { activeTab, toggle } = useLiveSidebar()

  if (!gameStarted) return null

  const isActive = activeTab === 'log'

  return (
    <button
      type="button"
      onClick={() => toggle('log')}
      className="p-1.5 rounded-lg transition-all cursor-pointer"
      style={{
        backgroundColor: isActive ? 'var(--game-bg-elevated)' : 'transparent',
        color: isActive ? 'var(--game-text-primary)' : 'var(--game-text-muted)',
      }}
    >
      <ScrollText className="h-4 w-4" />
    </button>
  )
}

function Panel() {
  const { activeTab, close } = useLiveSidebar()
  const open = activeTab !== null

  const roomJoinRequests = useMeetingStore((s) => s.joinRequests)
  const roomDismissJoinRequest = useMeetingStore((s) => s.dismissJoinRequest)
  const roomAcceptJoinRequest = useMeetingStore((s) => s.acceptJoinRequest)
  const roomRejectJoinRequest = useMeetingStore((s) => s.rejectJoinRequest)
  const { joinRequests, acceptJoinRequest, rejectJoinRequest } =
    useJoinRequests({
      joinRequests: roomJoinRequests,
      dismissJoinRequest: roomDismissJoinRequest,
      acceptJoinRequest: roomAcceptJoinRequest,
      rejectJoinRequest: roomRejectJoinRequest,
    })
  const count = joinRequests.length

  const gameStarted = useGameStore((s) => s.gameStarted)
  const showPanel =
    open && ((activeTab === 'log' && gameStarted) || activeTab === 'requests')

  let title: string
  let TitleIcon: typeof ScrollText
  if (activeTab === 'log') {
    title = 'Event Log'
    TitleIcon = ScrollText
  } else if (activeTab === 'requests') {
    title = 'Join Requests'
    TitleIcon = Users
  } else {
    title = ''
    TitleIcon = ScrollText
  }

  return (
    <motion.aside
      initial={false}
      animate={{
        x: showPanel ? 0 : 'calc(100% + 1rem)',
        opacity: showPanel ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className={`fixed right-4 top-20 bottom-24 z-10 w-72 bg-[#1c1c1f] border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden shadow-2xl ${
        showPanel ? '' : 'pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <TitleIcon className="h-4 w-4 text-[#a1a1aa]" />
          <h2 className="text-sm font-medium text-[#f4f4f5]">{title}</h2>
          {activeTab === 'requests' && count > 0 && (
            <span className="text-[11px] font-medium text-[#a1a1aa] bg-white/[0.06] px-1.5 py-px rounded-full leading-relaxed">
              {count}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={close}
          className="p-1.5 rounded-full text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.06] transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'log' && <GameLog />}
        {activeTab === 'requests' && (
          <>
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
          </>
        )}
      </div>
    </motion.aside>
  )
}

LiveSidebar.LogToggle = LogToggle
LiveSidebar.Panel = Panel
