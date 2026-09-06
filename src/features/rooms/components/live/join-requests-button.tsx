import { Users } from 'lucide-react'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useLiveSidebar } from '#/features/rooms/components/live/live-sidebar'

export function JoinRequestsButton() {
  const joinRequests = useMeetingStore((s) => s.joinRequests)
  const count = joinRequests.length
  const { activeTab, toggle } = useLiveSidebar()

  return (
    <button
      type="button"
      onClick={() => toggle('requests')}
      className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer border text-xs font-semibold"
      style={{
        color:
          activeTab === 'requests'
            ? 'var(--game-text-primary)'
            : 'var(--game-text-muted)',
        backgroundColor:
          activeTab === 'requests'
            ? 'var(--game-bg-elevated)'
            : 'transparent',
        borderColor:
          activeTab === 'requests' ? 'var(--game-border)' : 'transparent',
      }}
      aria-label="Toggle join requests"
    >
      <Users className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Requests</span>
      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 text-[10px] font-bold text-white min-w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none px-1"
          style={{ backgroundColor: 'var(--game-crimson)' }}
        >
          {count}
        </span>
      )}
    </button>
  )
}
