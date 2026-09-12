import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMediaConfigStore } from '#/features/rooms/store/media-config-store'

export function VideoDeviceSelect() {
  const { t } = useTranslation()
  const videoDevices = useMediaConfigStore((s) => s.videoDevices)
  const selectedVideoDevice = useMediaConfigStore((s) => s.selectedVideoDevice)
  const changeVideoDevice = useMediaConfigStore((s) => s.changeVideoDevice)

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
        {t('room.join.cameraLabel')}
      </label>
      <div className="relative">
        <select
          value={selectedVideoDevice}
          onChange={(e) => changeVideoDevice(e.target.value)}
          className="h-10 w-full rounded-lg border border-white/5 bg-[#212124] ps-3 pe-8 text-sm text-[#f4f4f5] appearance-none focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:ring-offset-1 focus:ring-offset-[#161618]"
        >
          {videoDevices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label ||
                t('room.join.cameraFallback', {
                  id: d.deviceId.slice(0, 8),
                  defaultValue: `Camera ${d.deviceId.slice(0, 8)}`,
                })}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a]" />
      </div>
    </div>
  )
}
