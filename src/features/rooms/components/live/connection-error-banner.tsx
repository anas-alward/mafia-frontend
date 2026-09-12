import { WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'

export function ConnectionErrorBanner() {
  const { t } = useTranslation()
  const wsState = useMeetingStore((s) => s.wsState)
  const sendError = useMeetingStore((s) => s.sendError)

  if (wsState !== 'closed' && wsState !== 'error' && !sendError) return null

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
      style={{
        backgroundColor: 'rgba(240, 96, 107, 0.12)',
        borderBottom: '1px solid rgba(240, 96, 107, 0.2)',
        color: 'var(--game-crimson)',
      }}
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span className="text-xs">{sendError || t('room.connection.lost')}</span>
    </div>
  )
}
