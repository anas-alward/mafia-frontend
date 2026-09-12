import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { ROLES, Team, getRoleDefinition } from '#/features/game/constants/roles'
import { ACTION_REGISTRY, ActionType } from '#/features/game/constants/actions'
import { PHASE_META, Phase } from '#/features/game/constants/phases'
import {
  ROLE_COMPOSITIONS,
  SUPPORTED_PLAYER_COUNTS,
} from '#/features/game/constants/distribution'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/game/roles/$roleCode')({
  component: RoleDetailPage,
})

/** Table sizes whose composition includes the role. */
function appearsAt(code: string): number[] {
  return SUPPORTED_PLAYER_COUNTS.filter((count) =>
    (ROLE_COMPOSITIONS[count] ?? []).includes(code),
  )
}

function RoleDetailPage() {
  const { t, i18n } = useTranslation()
  const { roleCode } = Route.useParams()
  const role = getRoleDefinition(roleCode)

  if (!role) {
    return (
      <main>
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-20 px-4">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <h1 className="display-title text-4xl text-neutral-900">
              {t('game.pages.roleDetail.unknownTitle', {
                defaultValue: 'Unknown role',
              })}
            </h1>
            <p className="text-base text-neutral-600">
              {t('game.pages.roleDetail.unknownText', {
                code: roleCode,
                defaultValue: `No role with code “${roleCode}” exists in this game.`,
              })}
            </p>
            <Button asChild size="lg" className="text-white">
              <Link to="/game/roles">
                {t('game.pages.roleDetail.browseRoles', {
                  defaultValue: 'Browse all roles',
                })}
              </Link>
            </Button>
          </div>
        </section>
      </main>
    )
  }

  const Icon = role.Icon
  const index = ROLES.findIndex((r) => r.code === role.code)
  const prev = ROLES[(index - 1 + ROLES.length) % ROLES.length]
  const next = ROLES[(index + 1) % ROLES.length]
  const tables = appearsAt(role.code)
  const minPlayers = tables.length > 0 ? Math.min(...tables) : null
  const isRtl = i18n.language.startsWith('ar')

  const roleName = t(`game.roles.${role.code}.name`, {
    defaultValue: role.name,
  })
  const teamName = t(`game.teams.${role.role_type}`, {
    defaultValue: role.role_type === Team.MAFIA ? 'Mafia' : 'Town',
  })
  const phaseLabel = (phase: Phase) =>
    t(`game.phases.${phase}.label`, {
      defaultValue: PHASE_META[phase].label,
    })
  // Arabic has no case — only lowercase the phase name for English.
  const phaseNameForSentence = (phase: Phase) => {
    const label = phaseLabel(phase)
    return isRtl ? label : label.toLowerCase()
  }
  const actionLabel = (actionType: string, fallback: string) =>
    t(`game.actions.${actionType}.label`, { defaultValue: fallback })
  const roleNameOf = (code: string, fallback: string) =>
    t(`game.roles.${code}.name`, { defaultValue: fallback })

  const abilityGroups: {
    phase: Phase
    headingKey: string
    fallback: string
  }[] = [
    {
      phase: Phase.NIGHT,
      headingKey: 'abilityNight',
      fallback: 'Night ability',
    },
    { phase: Phase.DAY, headingKey: 'abilityDay', fallback: 'Day ability' },
    {
      phase: Phase.VOTE_RESULT,
      headingKey: 'abilityVoteResult',
      fallback: 'Vote result ability',
    },
  ]

  return (
    <main>
      <section className="pt-20 pb-8 sm:pt-28 sm:pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/game/roles"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 underline underline-offset-2 hover:text-neutral-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            {t('game.pages.roleDetail.backToRoles', {
              defaultValue: 'All roles',
            })}
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-neutral-900 text-white">
              <Icon className="w-7 h-7" aria-hidden="true" />
            </div>
            <Badge
              variant="secondary"
              className="text-xs uppercase tracking-wider font-semibold"
            >
              {teamName}
            </Badge>
          </div>

          <h1 className="display-title text-4xl sm:text-5xl text-neutral-900 leading-tight">
            {roleName}
          </h1>
          <p className="mt-4 text-lg text-neutral-600 leading-relaxed">
            {t(`game.roles.${role.code}.description`, {
              defaultValue: role.description,
            })}
          </p>
        </div>
      </section>

      <section
        aria-label={t('game.pages.roleDetail.abilitiesLabel', {
          defaultValue: 'Abilities',
        })}
        className="py-8 px-4"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {abilityGroups.map(({ phase, headingKey, fallback }) => {
            const PhaseIcon = PHASE_META[phase].Icon
            const actions = role.actions[phase] ?? []
            return (
              <div
                key={phase}
                className="rounded-xl border border-neutral-200 bg-white p-5"
              >
                <p className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                  <PhaseIcon className="w-4 h-4" aria-hidden="true" />
                  {t(`game.pages.roleDetail.${headingKey}`, {
                    defaultValue: fallback,
                  })}
                </p>
                {actions.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    {t('game.pages.roleDetail.noAbility', {
                      phase: phaseNameForSentence(phase),
                      defaultValue: `No ${PHASE_META[phase].label.toLowerCase()} ability.`,
                    })}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {actions.map((action) => {
                      const ActionIcon =
                        ACTION_REGISTRY[action.action_type].Icon
                      return (
                        <li
                          key={action.action_type}
                          className="flex items-center gap-2.5 text-sm text-neutral-600"
                        >
                          <ActionIcon
                            className="w-4 h-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="font-medium text-neutral-900">
                            {actionLabel(
                              action.action_type,
                              ACTION_REGISTRY[action.action_type].label,
                            )}
                          </span>
                          <span className="text-neutral-400">·</span>
                          <span>
                            {action.action_type === ActionType.VOTE
                              ? t('game.pages.roleDetail.voteWithOthers', {
                                  defaultValue:
                                    'Cast a vote with everyone else',
                                })
                              : action.required
                                ? t('game.pages.roleDetail.mustAct', {
                                    defaultValue: 'Must act every time',
                                  })
                                : t('game.pages.roleDetail.optional', {
                                    defaultValue: 'Optional — use it or skip',
                                  })}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section
        aria-label={t('game.pages.roleDetail.tableSizesLabel', {
          defaultValue: 'Table sizes',
        })}
        className="py-8 px-4"
      >
        <div className="max-w-3xl mx-auto rounded-xl border border-neutral-200 bg-white p-5">
          {minPlayers === null ? (
            <>
              <p className="font-semibold text-neutral-900 mb-1">
                {t('game.pages.roleDetail.notInDistribution', {
                  defaultValue: 'Not in the current distribution',
                })}
              </p>
              <p className="text-sm text-neutral-600">
                {t('game.pages.roleDetail.notDealtText', {
                  defaultValue:
                    'This role is not dealt at any supported table size.',
                })}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-neutral-900 mb-1">
                {t('game.pages.roleDetail.includedFrom', {
                  min: minPlayers,
                  defaultValue: `Included from ${minPlayers} players`,
                })}
                {tables.length > 1 &&
                  t('game.pages.roleDetail.appearsIn', {
                    tables: tables.join(', '),
                    defaultValue: ` — appears in ${tables.join(', ')} player games`,
                  })}
              </p>
              <p className="text-sm text-neutral-600">
                <Link
                  to="/game/roles/distribution"
                  className="underline underline-offset-2 hover:text-neutral-900"
                >
                  {t('game.pages.roleDetail.seeDistributionTable', {
                    defaultValue: 'See the full distribution table',
                  })}
                </Link>
              </p>
            </>
          )}
        </div>
      </section>

      <nav
        aria-label={t('game.pages.roleDetail.moreRoles', {
          defaultValue: 'More roles',
        })}
        className="py-12 px-4 flex items-center justify-between max-w-3xl mx-auto gap-3"
      >
        <Button asChild variant="outline">
          <Link to="/game/roles/$roleCode" params={{ roleCode: prev.code }}>
            <ArrowLeft
              className="w-4 h-4 me-2 rtl:rotate-180"
              aria-hidden="true"
            />
            {roleNameOf(prev.code, prev.name)}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/game/roles/$roleCode" params={{ roleCode: next.code }}>
            {roleNameOf(next.code, next.name)}
            <ArrowRight
              className="w-4 h-4 ms-2 rtl:rotate-180"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </nav>
    </main>
  )
}
