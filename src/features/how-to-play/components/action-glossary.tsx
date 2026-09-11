import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ACTION_REGISTRY, ActionType } from '#/features/game/constants/actions'
import { ROLES } from '#/features/game/constants/roles'
import { PHASE_META, Phase } from '#/features/game/constants/phases'

/** Names of roles that can perform the action in any phase. */
function usedBy(actionType: ActionType): string[] {
  return ROLES.filter((role) =>
    (Object.values(Phase) as Phase[]).some((phase) =>
      (role.actions[phase] ?? []).some(
        (action) => action.action_type === actionType,
      ),
    ),
  ).map((role) => role.name)
}

/** Phase labels where the action appears. */
function usedIn(actionType: ActionType): string[] {
  return (Object.values(Phase) as Phase[])
    .filter((phase) =>
      ROLES.some((role) =>
        (role.actions[phase] ?? []).some(
          (action) => action.action_type === actionType,
        ),
      ),
    )
    .map((phase) => PHASE_META[phase].label)
}

function ActionCard({ actionType }: { actionType: ActionType }) {
  const definition = ACTION_REGISTRY[actionType]
  const Icon = definition.Icon
  const roles = usedBy(actionType)

  return (
    <Card className="feature-card transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-neutral-500">
            {usedIn(actionType).join(' · ')}
          </span>
        </div>
        <CardTitle className="text-lg text-neutral-900">
          {definition.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm text-neutral-600 leading-relaxed">
          Announced as “{definition.eventMessage}”.
        </CardDescription>
        <div className="pt-3 border-t border-neutral-200">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Used by
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {roles.length > 0 ? roles.join(', ') : '—'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActionGlossary() {
  return (
    <section aria-labelledby="actions-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="text-center mb-10">
          <p className="island-kicker mb-3">The Moves</p>
          <h2
            id="actions-heading"
            className="display-title text-3xl sm:text-4xl text-neutral-900"
          >
            Every action, explained
          </h2>
          <p className="mt-4 text-base text-neutral-600 max-w-lg mx-auto leading-relaxed">
            These are all the moves in the game — who can use them, when, and
            what the village sees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.values(ActionType) as ActionType[]).map((actionType) => (
            <ActionCard key={actionType} actionType={actionType} />
          ))}
        </div>
      </div>
    </section>
  )
}
