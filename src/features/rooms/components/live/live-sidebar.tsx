import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { Users, UserPlus, X, Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useParticipants } from '@livekit/components-react'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useJoinRequests } from '#/features/rooms/hooks/use-join-requests'
import { MembersList } from './members-list'

type SidebarTab = 'members' | 'requests' | null

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

function Panel() {
  const { t } = useTranslation()
  const { activeTab, close } = useLiveSidebar()
  const open = activeTab !== null

  const isHost = useMeetingStore((s) => s.isHost)
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

  const showPanel = open

  let title: string
  let TitleIcon: typeof Users
  if (activeTab === 'members') {
    title = t('room.sidebar.members')
    TitleIcon = Users
  } else if (activeTab === 'requests') {
    title = t('room.sidebar.requests')
    TitleIcon = UserPlus
  } else {
    title = ''
    TitleIcon = Users
  }

  return (
    <motion.aside
      initial={false}
      animate={{
        x: showPanel ? 0 : 'calc(100% + 1rem)',
        opacity: showPanel ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className={`fixed end-4 top-20 bottom-24 z-40 w-72 bg-[#1c1c1f] border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden shadow-2xl ${
        showPanel ? '' : 'pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <TitleIcon className="h-4 w-4 text-[#a1a1aa]" />
          <h2 className="text-sm font-medium text-[#f4f4f5]">{title}</h2>
          {activeTab === 'members' && <MembersCount />}
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
          aria-label={t('room.sidebar.close')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'members' && <MembersList />}
        {activeTab === 'requests' && (
          <>
            {count === 0 ? (
              <p className="px-5 py-12 text-[13px] text-[#71717a] text-center">
                {t('room.sidebar.noRequests')}
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
                      {/* Accept / reject — host-only; non-hosts just see
                          the request */}
                      {isHost && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => acceptJoinRequest(req.userId)}
                            className="p-2 rounded-full text-[#a1a1aa] hover:text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors"
                            aria-label={t('room.sidebar.acceptUser', {
                              name: req.username,
                              defaultValue: `Accept ${req.username}`,
                            })}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectJoinRequest(req.userId)}
                            className="p-2 rounded-full text-[#a1a1aa] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                            aria-label={t('room.sidebar.rejectUser', {
                              name: req.username,
                              defaultValue: `Reject ${req.username}`,
                            })}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
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

function MembersCount() {
  const participants = useParticipants()
  return (
    <span className="text-[11px] font-medium text-[#a1a1aa] bg-white/[0.06] px-1.5 py-px rounded-full leading-relaxed">
      {participants.length}
    </span>
  )
}

LiveSidebar.Panel = Panel
