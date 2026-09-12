import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ROLES } from '#/features/game/constants/roles'
import { ACTION_REGISTRY, ActionType } from '#/features/game/constants/actions'
import { PHASE_META, Phase } from '#/features/game/constants/phases'
import { Repeat } from 'lucide-react'

const phaseOrder: Phase[] = [Phase.NIGHT, Phase.DAY, Phase.VOTE_RESULT]

const phaseDescriptions: Record<Phase, string> = {
  [Phase.NIGHT]:
    'The village sleeps. Players with night abilities act one by one, in secret. Nobody sees who chose whom — only the outcomes surface in the morning.',
  [Phase.DAY]:
    'The village wakes and talks. Everyone discusses the events of the night, shares suspicions, and defends themselves. The Vigilante may spend a bullet instead of voting — but shooting a Town player backfires.',
  [Phase.VOTE_RESULT]:
    'Discussion ends and every living player votes. The top suspect is eliminated and their role is revealed for all to see. If the Crimson Kamikaze dies, they take their killer down with them.',
}

/** Roles with a non-vote action in the given phase. */
function actingRoles(phase: Phase): string[] {
  return ROLES.filter((role) =>
    (role.actions[phase] ?? []).some(
      (action) => action.action_type !== ActionType.VOTE,
    ),
  ).map((role) => role.name)
}

function actingActionLabels(phase: Phase): string {
  const labels = new Set<string>()
  for (const role of ROLES) {
    for (const action of role.actions[phase] ?? []) {
      if (action.action_type !== ActionType.VOTE) {
        labels.add(ACTION_REGISTRY[action.action_type].label)
      }
    }
  }
  return [...labels].join(' · ')
}

/**
 * Interactive phase explorer: tab per phase with a detail card showing
 * what happens, who acts, and which actions resolve.
 */
export function PhaseExplorer() {
  const [activePhase, setActivePhase] = useState<Phase>(Phase.NIGHT)

  return (
    <section aria-labelledby="phases-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="max-w-3xl mx-auto">
          <div
            role="tablist"
            aria-label="Explore each phase"
            className="flex items-center justify-center gap-2 mb-6"
          >
            {phaseOrder.map((phase) => {
              const PhaseIcon = PHASE_META[phase].Icon
              return (
                <button
                  key={phase}
                  role="tab"
                  aria-selected={activePhase === phase}
                  onClick={() => setActivePhase(phase)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activePhase === phase
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <PhaseIcon className="w-4 h-4" aria-hidden="true" />
                  {PHASE_META[phase].label}
                </button>
              )
            })}
          </div>

          <Card className="feature-card">
            <CardHeader>
              <CardTitle className="text-xl text-neutral-900">
                {PHASE_META[activePhase].label} phase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm text-neutral-600 leading-relaxed">
                {phaseDescriptions[activePhase]}
              </CardDescription>
              <div className="pt-3 border-t border-neutral-200">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Who acts
                </p>
                <p className="text-sm text-neutral-900">
                  {actingRoles(activePhase).join(', ') || 'All players'}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Actions:{' '}
                  {actingActionLabels(activePhase) || 'Discussion + vote'}
                </p>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
                Night, day, and vote repeat until a side wins.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
