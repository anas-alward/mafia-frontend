import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ROLES, getRoleDefinition } from '#/features/game/constants/roles'
import { ACTION_REGISTRY, ActionType } from '#/features/game/constants/actions'
import { PHASE_META, Phase } from '#/features/game/constants/phases'
import { Repeat } from 'lucide-react'

const phaseOrder: Phase[] = [Phase.NIGHT, Phase.DAY, Phase.VOTE_RESULT]

// English fallback descriptions (translated at the render site via game.phases).
const phaseDescriptionFallbacks: Record<Phase, string> = {
  [Phase.NIGHT]:
    'The village sleeps. Players with night abilities act one by one, in secret. Nobody sees who chose whom — only the outcomes surface in the morning.',
  [Phase.DAY]:
    'The village wakes and talks. Everyone discusses the events of the night, shares suspicions, and defends themselves. The Vigilante may spend a bullet instead of voting — but shooting a Town player backfires.',
  [Phase.VOTE_RESULT]:
    'Discussion ends and every living player votes. The top suspect is eliminated and their role is revealed for all to see. If the Crimson Kamikaze dies, they take their killer down with them.',
}

/** Codes of roles with a non-vote action in the given phase. */
function actingRoleCodes(phase: Phase): string[] {
  return ROLES.filter((role) =>
    (role.actions[phase] ?? []).some(
      (action) => action.action_type !== ActionType.VOTE,
    ),
  ).map((role) => role.code)
}

function actingActionTypes(phase: Phase): ActionType[] {
  const types = new Set<ActionType>()
  for (const role of ROLES) {
    for (const action of role.actions[phase] ?? []) {
      if (action.action_type !== ActionType.VOTE) {
        types.add(action.action_type)
      }
    }
  }
  return [...types]
}

/**
 * Interactive phase explorer: tab per phase with a detail card showing
 * what happens, who acts, and which actions resolve.
 */
export function PhaseExplorer() {
  const { t } = useTranslation()
  const [activePhase, setActivePhase] = useState<Phase>(Phase.NIGHT)

  const phaseLabel = (phase: Phase, fallback: string) =>
    t(`game.phases.${phase}.label`, { defaultValue: fallback })
  const actionLabel = (actionType: ActionType, fallback: string) =>
    t(`game.actions.${actionType}.label`, { defaultValue: fallback })

  return (
    <section aria-labelledby="phases-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="max-w-3xl mx-auto">
          <div
            role="tablist"
            aria-label={t('game.phaseExplorer.tablistLabel', {
              defaultValue: 'Explore each phase',
            })}
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
                  {phaseLabel(phase, PHASE_META[phase].label)}
                </button>
              )
            })}
          </div>

          <Card className="feature-card">
            <CardHeader>
              <CardTitle className="text-xl text-neutral-900">
                {t('game.phaseExplorer.titleSuffix', {
                  phase: phaseLabel(activePhase, PHASE_META[activePhase].label),
                  defaultValue: `${PHASE_META[activePhase].label} phase`,
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm text-neutral-600 leading-relaxed">
                {t(`game.phases.${activePhase}.description`, {
                  defaultValue: phaseDescriptionFallbacks[activePhase],
                })}
              </CardDescription>
              <div className="pt-3 border-t border-neutral-200">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  {t('game.phaseExplorer.whoActs', {
                    defaultValue: 'Who acts',
                  })}
                </p>
                <p className="text-sm text-neutral-900">
                  {actingRoleCodes(activePhase)
                    .map((code) =>
                      t(`game.roles.${code}.name`, {
                        defaultValue: getRoleDefinition(code)?.name ?? code,
                      }),
                    )
                    .join(', ') ||
                    t('game.phaseExplorer.allPlayers', {
                      defaultValue: 'All players',
                    })}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {t('game.phaseExplorer.actionsLabel', {
                    defaultValue: 'Actions',
                  })}
                  :{' '}
                  {actingActionTypes(activePhase)
                    .map((actionType) =>
                      actionLabel(
                        actionType,
                        ACTION_REGISTRY[actionType].label,
                      ),
                    )
                    .join(' · ') ||
                    t('game.phaseExplorer.discussionVote', {
                      defaultValue: 'Discussion + vote',
                    })}
                </p>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
                {t('game.phaseExplorer.repeatNote', {
                  defaultValue:
                    'Night, day, and vote repeat until a side wins.',
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
