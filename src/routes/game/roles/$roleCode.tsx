import { createFileRoute, Link } from '@tanstack/react-router'
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
  const { roleCode } = Route.useParams()
  const role = getRoleDefinition(roleCode)

  if (!role) {
    return (
      <main>
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-20 px-4">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <h1 className="display-title text-4xl text-neutral-900">
              Unknown role
            </h1>
            <p className="text-base text-neutral-600">
              No role with code “{roleCode}” exists in this game.
            </p>
            <Button asChild size="lg" className="text-white">
              <Link to="/game/roles">Browse all roles</Link>
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

  const abilityGroups: { phase: Phase; heading: string }[] = [
    { phase: Phase.NIGHT, heading: 'Night ability' },
    { phase: Phase.DAY, heading: 'Day ability' },
    { phase: Phase.VOTE_RESULT, heading: 'Vote result ability' },
  ]

  return (
    <main>
      <section className="pt-20 pb-8 sm:pt-28 sm:pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/game/roles"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 underline underline-offset-2 hover:text-neutral-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            All roles
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-neutral-900 text-white">
              <Icon className="w-7 h-7" aria-hidden="true" />
            </div>
            <Badge
              variant="secondary"
              className="text-xs uppercase tracking-wider font-semibold"
            >
              {role.role_type === Team.MAFIA ? 'Mafia' : 'Town'}
            </Badge>
          </div>

          <h1 className="display-title text-4xl sm:text-5xl text-neutral-900 leading-tight">
            {role.name}
          </h1>
          <p className="mt-4 text-lg text-neutral-600 leading-relaxed">
            {role.description}
          </p>
        </div>
      </section>

      <section aria-label="Abilities" className="py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {abilityGroups.map(({ phase, heading }) => {
            const PhaseIcon = PHASE_META[phase].Icon
            const actions = role.actions[phase] ?? []
            return (
              <div
                key={phase}
                className="rounded-xl border border-neutral-200 bg-white p-5"
              >
                <p className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                  <PhaseIcon className="w-4 h-4" aria-hidden="true" />
                  {heading}
                </p>
                {actions.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No {PHASE_META[phase].label.toLowerCase()} ability.
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
                            {ACTION_REGISTRY[action.action_type].label}
                          </span>
                          <span className="text-neutral-400">·</span>
                          <span>
                            {action.action_type === ActionType.VOTE
                              ? 'Cast a vote with everyone else'
                              : action.required
                                ? 'Must act every time'
                                : 'Optional — use it or skip'}
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

      <section aria-label="Table sizes" className="py-8 px-4">
        <div className="max-w-3xl mx-auto rounded-xl border border-neutral-200 bg-white p-5">
          {minPlayers === null ? (
            <>
              <p className="font-semibold text-neutral-900 mb-1">
                Not in the current distribution
              </p>
              <p className="text-sm text-neutral-600">
                This role is not dealt at any supported table size.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-neutral-900 mb-1">
                Included from {minPlayers} players
                {tables.length > 1 &&
                  ` — appears in ${tables.join(', ')} player games`}
              </p>
              <p className="text-sm text-neutral-600">
                <Link
                  to="/game/roles/distribution"
                  className="underline underline-offset-2 hover:text-neutral-900"
                >
                  See the full distribution table
                </Link>
              </p>
            </>
          )}
        </div>
      </section>

      <nav
        aria-label="More roles"
        className="py-12 px-4 flex items-center justify-between max-w-3xl mx-auto gap-3"
      >
        <Button asChild variant="outline">
          <Link to="/game/roles/$roleCode" params={{ roleCode: prev.code }}>
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            {prev.name}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/game/roles/$roleCode" params={{ roleCode: next.code }}>
            {next.name}
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </Link>
        </Button>
      </nav>
    </main>
  )
}
