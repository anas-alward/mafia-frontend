import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/rooms/$roomId/ended')({
  component: MeetingEndedRoute,
})

function MeetingEndedRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#161618]">
      <div className="text-center space-y-6">
        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto">
          <LogOut className="h-5 w-5 text-[#71717a] rtl:rotate-180" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#f4f4f5]">
            {t('room.ended.title')}
          </h2>
          <p className="text-sm text-[#71717a]">{t('room.ended.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 text-[#f4f4f5] hover:bg-white/10 transition-colors text-sm font-medium"
        >
          {t('room.ended.back')}
        </button>
      </div>
    </div>
  )
}
