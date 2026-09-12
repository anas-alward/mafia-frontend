import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Skull, ShieldCheck, Trophy, X, RotateCcw } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import type { Winner } from '#/features/game/events'

interface TeamMeta {
  label: string
  color: string
  glow: string
  icon: typeof Skull
}

const TEAM_META: Record<Winner, TeamMeta> = {
  mafia: {
    label: 'Mafia',
    color: 'var(--game-crimson)',
    glow: 'rgba(240, 96, 107, 0.45)',
    icon: Skull,
  },
  town: {
    label: 'Town',
    color: 'var(--game-mint)',
    glow: 'rgba(77, 232, 160, 0.45)',
    icon: ShieldCheck,
  },
}

const LOSER_OF: Record<Winner, Winner> = {
  mafia: 'town',
  town: 'mafia',
}

export function GameOverOverlay() {
  const { t } = useTranslation()
  const phase = useGameStore((s) => s.phase)
  const winner = useGameStore((s) => s.winner)
  const resetGame = useGameStore((s) => s.resetGame)
  const isHost = useMeetingStore((s) => s.isHost)

  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (winner != null) setDismissed(false)
  }, [winner])

  const show = phase === 'ended' && winner != null && !dismissed
  const winnerMeta = winner ? TEAM_META[winner] : null
  const loserMeta = winner ? TEAM_META[LOSER_OF[winner]] : null
  const WinnerIcon = winnerMeta?.icon
  const winnerLabel = winner
    ? t(`game.teams.${winner}`, { defaultValue: winnerMeta?.label ?? winner })
    : null
  const loserLabel =
    winner && loserMeta
      ? t(`game.teams.${LOSER_OF[winner]}`, {
          defaultValue: loserMeta.label,
        })
      : null

  return (
    <AnimatePresence>
      {show && winnerMeta && loserMeta && WinnerIcon && (
        <motion.div
          key="game-over"
          className="absolute inset-0 z-[60] flex items-center justify-center px-6"
          style={{
            backgroundColor: 'rgba(19, 19, 20, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={t('game.gameOver.dismiss', { defaultValue: 'Dismiss' })}
            className="absolute top-4 end-4 p-2 rounded-full transition-colors cursor-pointer"
            style={{
              color: 'var(--game-text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--game-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--game-text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--game-text-muted)'
            }}
          >
            <X className="h-5 w-5" />
          </button>

          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -18 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <Trophy
                className="h-14 w-14"
                style={{
                  color: winnerMeta.color,
                  filter: `drop-shadow(0 0 18px ${winnerMeta.glow})`,
                }}
              />
            </motion.div>

            <p
              className="mt-6 text-xs font-bold tracking-[0.28em] uppercase"
              style={{ color: 'var(--game-text-muted)' }}
            >
              {t('game.gameOver.title', { defaultValue: 'Game Over' })}
            </p>

            <h2
              className="display-title mt-2 text-5xl font-bold leading-tight"
              style={{
                color: winnerMeta.color,
                textShadow: `0 0 32px ${winnerMeta.glow}`,
              }}
            >
              {t('game.gameOver.wins', {
                team: winnerLabel ?? winnerMeta.label,
                defaultValue: `${winnerMeta.label} Wins`,
              })}
            </h2>

            <div className="mt-8 flex items-center gap-3">
              <TeamPill
                meta={winnerMeta}
                label={winnerLabel ?? winnerMeta.label}
                outcome={t('game.gameOver.victory', {
                  defaultValue: 'Victory',
                })}
                isVictory
              />
              <TeamPill
                meta={loserMeta}
                label={loserLabel ?? loserMeta.label}
                outcome={t('game.gameOver.defeated', {
                  defaultValue: 'Defeated',
                })}
                isVictory={false}
              />
            </div>

            {isHost && (
              <button
                type="button"
                onClick={resetGame}
                className="mt-8 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
                style={{
                  color: '#1B1922',
                  backgroundColor: 'var(--game-gold)',
                  boxShadow: '0 0 20px rgba(237, 184, 58, 0.35)',
                }}
              >
                <RotateCcw className="h-4 w-4" />
                {t('game.gameOver.playAgain', { defaultValue: 'Play Again' })}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TeamPill({
  meta,
  label,
  outcome,
  isVictory,
}: {
  meta: TeamMeta
  label: string
  outcome: string
  isVictory: boolean
}) {
  const Icon = meta.icon

  return (
    <div
      className="flex items-center gap-2 rounded-2xl px-5 py-3"
      style={{
        backgroundColor: isVictory
          ? 'rgba(255, 255, 255, 0.04)'
          : 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${isVictory ? meta.color : 'var(--game-border)'}`,
        boxShadow: isVictory ? `0 0 24px ${meta.glow}` : 'none',
      }}
    >
      <Icon className="h-5 w-5" style={{ color: meta.color }} />
      <div className="flex flex-col items-start leading-tight">
        <span
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: 'var(--game-text-muted)' }}
        >
          {outcome}
        </span>
        <span
          className="text-sm font-bold"
          style={{ color: isVictory ? meta.color : 'var(--game-text-muted)' }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
