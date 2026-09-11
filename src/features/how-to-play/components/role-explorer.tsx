import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { ROLES, Team } from '#/features/game/constants/roles'
import type { RoleDefinition } from '#/features/game/constants/roles'
import { ACTION_REGISTRY, ActionType } from '#/features/game/constants/actions'
import { PHASE_META, Phase } from '#/features/game/constants/phases'
import { ChevronDown } from 'lucide-react'

type TeamFilter = 'all' | Team

const filters: { value: TeamFilter; label: string }[] = [
  { value: 'all', label: 'All roles' },
  { value: Team.TOWN, label: 'Town' },
  { value: Team.MAFIA, label: 'Mafia' },
]

/** Special abilities per phase — plain voting is universal, so it's skipped. */
function getSpecialActions(
  role: RoleDefinition,
): { phase: Phase; labels: string[] }[] {
  return (Object.values(Phase) as Phase[])
    .map((phase) => ({
      phase,
      labels: (role.actions[phase] ?? [])
        .filter((action) => action.action_type !== ActionType.VOTE)
        .map((action) => ACTION_REGISTRY[action.action_type].label),
    }))
    .filter((entry) => entry.labels.length > 0)
}

function RoleCard({ role }: { role: RoleDefinition }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = role.Icon
  const specials = getSpecialActions(role)

  return (
    <Card className="feature-card transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <Badge
            variant="secondary"
            className="text-[0.65rem] uppercase tracking-wider font-semibold"
          >
            {role.role_type === Team.MAFIA ? 'Mafia' : 'Town'}
          </Badge>
        </div>
        <CardTitle className="text-lg text-neutral-900">{role.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm text-neutral-600 leading-relaxed">
          {role.description}
        </CardDescription>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-900 underline underline-offset-2"
        >
          {expanded ? 'Hide abilities' : 'Show abilities'}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {expanded && (
          <ul className="pt-3 border-t border-neutral-200 space-y-2">
            {specials.map(({ phase, labels }) => {
              const PhaseIcon = PHASE_META[phase].Icon
              return (
                <li
                  key={phase}
                  className="flex items-start gap-2 text-xs text-neutral-600"
                >
                  <PhaseIcon
                    className="w-3.5 h-3.5 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-semibold text-neutral-900">
                      {PHASE_META[phase].label}:
                    </span>{' '}
                    {labels.join(' + ')}
                  </span>
                </li>
              )
            })}
            <li className="text-xs text-neutral-500">
              Everyone votes during the day.
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function RoleExplorer() {
  const [filter, setFilter] = useState<TeamFilter>('all')
  const visible =
    filter === 'all' ? ROLES : ROLES.filter((role) => role.role_type === filter)

  return (
    <section aria-labelledby="roles-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="text-center mb-10">
          <p className="island-kicker mb-3">The Cast</p>
          <h2
            id="roles-heading"
            className="display-title text-3xl sm:text-4xl text-neutral-900"
          >
            Meet the roles
          </h2>
          <p className="mt-4 text-base text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Your role is secret. Learn what everyone at the table might be
            plotting.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter roles by team"
          className="flex items-center justify-center gap-2 mb-10"
        >
          {filters.map(({ value, label }) => (
            <button
              key={value}
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visible.map((role) => (
            <RoleCard key={role.code} role={role} />
          ))}
        </div>
      </div>
    </section>
  )
}
