import type { LucideIcon } from 'lucide-react'
import { Sun, Moon, Gavel } from 'lucide-react'

export enum Phase {
  DAY = 'day',
  NIGHT = 'night',
  VOTE_RESULT = 'vote_result',
}

export interface PhaseDisplayConfig {
  label: string
  Icon: LucideIcon
  color: string
  textColor: string
  glow: string
}

export const PHASE_META: Record<Phase, PhaseDisplayConfig> = {
  [Phase.DAY]: {
    label: 'Day',
    Icon: Sun,
    color: 'text-amber-400',
    textColor: '#EDB83A',
    glow: 'rgba(237, 184, 58, 0.2)',
  },
  [Phase.NIGHT]: {
    label: 'Night',
    Icon: Moon,
    color: 'text-indigo-400',
    textColor: '#8FA0F5',
    glow: 'rgba(143, 160, 245, 0.2)',
  },
  [Phase.VOTE_RESULT]: {
    label: 'Vote Result',
    Icon: Gavel,
    color: 'text-orange-400',
    textColor: '#F5925E',
    glow: 'rgba(245, 146, 94, 0.2)',
  },
}

// Mirrors backend: apps/game/engine/round.py GRACE_SECONDS
export const GRACE_SECONDS = 5.0
