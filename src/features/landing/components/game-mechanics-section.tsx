import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Moon, Sun, Gavel, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { GamePhase } from '../data/phases'

const iconMap: Record<string, LucideIcon> = {
  moon: Moon,
  sun: Sun,
  gavel: Gavel,
}

interface GameMechanicsSectionProps {
  title: string
  phases: GamePhase[]
}

function PhaseCard({ phase, isLast }: { phase: GamePhase; isLast: boolean }) {
  const Icon = iconMap[phase.icon]

  return (
    <div className="flex items-start gap-0">
      <Card className="island-shell flex-1 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-900 shrink-0">
              <Icon className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-full">
                {phase.order}
              </span>
            </div>
          </div>
          <CardTitle className="text-xl text-neutral-900">
            {phase.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CardDescription className="text-sm text-neutral-600 leading-relaxed">
            {phase.description}
          </CardDescription>
          <div className="pt-3 border-t border-neutral-200">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Who Acts
            </p>
            <p className="text-sm text-neutral-900 mt-1">
              {phase.activeRoles}
            </p>
          </div>
        </CardContent>
      </Card>

      {!isLast && (
        <div className="flex items-center justify-center shrink-0 w-12 mx-2 pt-20">
          <ArrowRight
            className="w-5 h-5 text-neutral-300 phase-connector"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  )
}

export function GameMechanicsSection({
  title,
  phases,
}: GameMechanicsSectionProps) {
  return (
    <section id="game-mechanics" className="py-20 sm:py-28 reveal-on-scroll">
      <div className="page-wrap">
        <div className="text-center mb-14">
          <p className="island-kicker mb-3">How a Round Works</p>
          <h2 className="display-title text-3xl sm:text-4xl md:text-5xl text-neutral-900">
            {title}
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-start max-w-4xl mx-auto">
          {phases.map((phase, index) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              isLast={index === phases.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
