import { useRef, useState } from 'react'
import { useParticipants } from '@livekit/components-react'
import { Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import StartGameTooltip from '#/features/rooms/components/live/start-game-tooltip'

const orbBase =
  'relative flex items-center justify-center h-9 w-9 rounded-xl border transition-all duration-200 cursor-pointer'

interface StartGameButtonProps {
  onStartGame: (playerIds: number[]) => void
}

export function StartGameButton({ onStartGame }: StartGameButtonProps) {
  const { t } = useTranslation()
  const allParticipants = useParticipants()
  const [showStartTooltip, setShowStartTooltip] = useState(false)
  const startBtnRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button
        ref={startBtnRef}
        type="button"
        onClick={() => setShowStartTooltip((prev) => !prev)}
        title={t('room.controlBar.startGame')}
        className={`${orbBase} cursor-pointer`}
        style={{
          color: 'var(--game-gold)',
          backgroundColor: 'rgba(237, 184, 58, 0.1)',
          borderColor: 'rgba(237, 184, 58, 0.3)',
        }}
      >
        <Play className="h-4 w-4" />
      </button>
      <StartGameTooltip
        anchorRef={startBtnRef}
        participants={allParticipants}
        onStartGame={onStartGame}
        isOpen={showStartTooltip}
        onClose={() => setShowStartTooltip(false)}
      />
    </>
  )
}
