import { useTranslation } from 'react-i18next'

interface ParticipantNameTagProps {
  name?: string
  isSpeaking: boolean
}

export function ParticipantNameTag({
  name,
  isSpeaking,
}: ParticipantNameTagProps) {
  const { t } = useTranslation()
  return (
    <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 backdrop-blur-sm">
      <span
        className={`h-1.5 w-1.5 rounded-full transition-colors duration-150 ${
          isSpeaking ? 'bg-[#8FA0F5]' : 'bg-white/30'
        }`}
      />
      <span className="text-xs font-medium text-white/90 select-none">
        {name || t('room.tiles.guest', { defaultValue: 'Guest' })}
      </span>
    </div>
  )
}
