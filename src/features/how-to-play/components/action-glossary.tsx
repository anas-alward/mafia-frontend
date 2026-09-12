import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ACTION_REGISTRY, ActionType } from '#/features/game/constants/actions'
import { ROLES, getRoleDefinition } from '#/features/game/constants/roles'
import { PHASE_META, Phase } from '#/features/game/constants/phases'
import { useTranslation } from 'react-i18next'

/** Codes of roles that can perform the action in any phase. */
function usedByCodes(actionType: ActionType): string[] {
  return ROLES.filter((role) =>
    (Object.values(Phase) as Phase[]).some((phase) =>
      (role.actions[phase] ?? []).some(
        (action) => action.action_type === actionType,
      ),
    ),
  ).map((role) => role.code)
}

/** Phases where the action appears. */
function usedInPhases(actionType: ActionType): Phase[] {
  return (Object.values(Phase) as Phase[]).filter((phase) =>
    ROLES.some((role) =>
      (role.actions[phase] ?? []).some(
        (action) => action.action_type === actionType,
      ),
    ),
  )
}

function ActionCard({ actionType }: { actionType: ActionType }) {
  const { t } = useTranslation()
  const definition = ACTION_REGISTRY[actionType]
  const Icon = definition.Icon
  const roleCodes = usedByCodes(actionType)

  return (
    <Card className="feature-card transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-neutral-500">
            {usedInPhases(actionType)
              .map((phase) =>
                t(`game.phases.${phase}.label`, {
                  defaultValue: PHASE_META[phase].label,
                }),
              )
              .join(' · ')}
          </span>
        </div>
        <CardTitle className="text-lg text-neutral-900">
          {t(`game.actions.${actionType}.label`, {
            defaultValue: definition.label,
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm text-neutral-600 leading-relaxed">
          {t('game.actionGlossary.announcedAs', {
            message: t(`game.actions.${actionType}.eventMessage`, {
              defaultValue: definition.eventMessage,
            }),
            defaultValue: `Announced as “${definition.eventMessage}”.`,
          })}
        </CardDescription>
        <div className="pt-3 border-t border-neutral-200">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            {t('game.actionGlossary.usedBy', { defaultValue: 'Used by' })}
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {roleCodes.length > 0
              ? roleCodes
                  .map((code) =>
                    t(`game.roles.${code}.name`, {
                      defaultValue: getRoleDefinition(code)?.name ?? code,
                    }),
                  )
                  .join(', ')
              : t('game.actionGlossary.none', { defaultValue: '—' })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActionGlossary() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="actions-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="text-center mb-10">
          <p className="island-kicker mb-3">
            {t('game.actionGlossary.kicker', { defaultValue: 'The Moves' })}
          </p>
          <h2
            id="actions-heading"
            className="display-title text-3xl sm:text-4xl text-neutral-900"
          >
            {t('game.actionGlossary.title', {
              defaultValue: 'Every action, explained',
            })}
          </h2>
          <p className="mt-4 text-base text-neutral-600 max-w-lg mx-auto leading-relaxed">
            {t('game.actionGlossary.subtitle', {
              defaultValue:
                'These are all the moves in the game — who can use them, when, and what the village sees.',
            })}
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
