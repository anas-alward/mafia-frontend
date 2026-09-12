import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  PHASE_META,
  Phase as GamePhaseEnum,
} from '#/features/game/constants/phases'
import type { GamePhase } from '#/features/game/events'

const GAMEPHASE_TO_PHASE: Partial<Record<GamePhase, GamePhaseEnum>> = {
  day: GamePhaseEnum.DAY,
  night: GamePhaseEnum.NIGHT,
  vote_result: GamePhaseEnum.VOTE_RESULT,
}

interface PhaseBadgeProps {
  phase: GamePhase
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  const { t } = useTranslation()
  const phaseEnum = GAMEPHASE_TO_PHASE[phase]
  const phaseMeta = phaseEnum ? PHASE_META[phaseEnum] : null
  const PhaseIcon = phaseMeta?.Icon ?? null

  if (!phaseMeta) return null

  return (
    <motion.div
      key={phase}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold tracking-wide"
      style={{
        color: '#1B1922',
        backgroundColor: phaseMeta.textColor,
        boxShadow: `0 0 16px ${phaseMeta.glow}`,
      }}
      initial={{ scale: 0.85, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {PhaseIcon && <PhaseIcon className="h-4 w-4" />}
      <span>
        {phaseEnum
          ? t(`game.phases.${phaseEnum}.label`, {
              defaultValue: phaseMeta.label,
            })
          : null}
      </span>
    </motion.div>
  )
}
