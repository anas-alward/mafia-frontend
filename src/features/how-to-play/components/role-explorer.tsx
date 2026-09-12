import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
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
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

type TeamFilter = 'all' | Team

const filterValues: TeamFilter[] = ['all', Team.TOWN, Team.MAFIA]

/** Special abilities per phase — plain voting is universal, so it's skipped. */
function getSpecialActions(
  role: RoleDefinition,
): { phase: Phase; actionTypes: ActionType[] }[] {
  return (Object.values(Phase) as Phase[])
    .map((phase) => ({
      phase,
      actionTypes: (role.actions[phase] ?? [])
        .filter((action) => action.action_type !== ActionType.VOTE)
        .map((action) => action.action_type),
    }))
    .filter((entry) => entry.actionTypes.length > 0)
}

function RoleCard({ role }: { role: RoleDefinition }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const Icon = role.Icon
  const specials = getSpecialActions(role)
  const roleName = t(`game.roles.${role.code}.name`, {
    defaultValue: role.name,
  })
  const teamName = t(`game.teams.${role.role_type}`, {
    defaultValue: role.role_type === Team.MAFIA ? 'Mafia' : 'Town',
  })

  return (
    <Card className="feature-card relative w-72 shrink-0 snap-start transition-colors hover:border-neutral-400">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <Badge
            variant="secondary"
            className="text-[0.65rem] uppercase tracking-wider font-semibold"
          >
            {teamName}
          </Badge>
        </div>
        <CardTitle className="text-lg text-neutral-900">{roleName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm text-neutral-600 leading-relaxed">
          {t(`game.roles.${role.code}.description`, {
            defaultValue: role.description,
          })}
        </CardDescription>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="relative z-10 flex items-center gap-1 text-xs font-semibold text-neutral-900 underline underline-offset-2"
        >
          {expanded
            ? t('game.roleExplorer.hideAbilities', {
                defaultValue: 'Hide abilities',
              })
            : t('game.roleExplorer.showAbilities', {
                defaultValue: 'Show abilities',
              })}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {expanded && (
          <ul className="pt-3 border-t border-neutral-200 space-y-2">
            {specials.map(({ phase, actionTypes }) => {
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
                      {t(`game.phases.${phase}.label`, {
                        defaultValue: PHASE_META[phase].label,
                      })}
                      :
                    </span>{' '}
                    {actionTypes
                      .map((actionType) =>
                        t(`game.actions.${actionType}.label`, {
                          defaultValue: ACTION_REGISTRY[actionType].label,
                        }),
                      )
                      .join(' + ')}
                  </span>
                </li>
              )
            })}
            <li className="text-xs text-neutral-500">
              {t('game.roleExplorer.everyoneVotes', {
                defaultValue: 'Everyone votes during the day.',
              })}
            </li>
          </ul>
        )}
      </CardContent>
      <Link
        to="/game/roles/$roleCode"
        params={{ roleCode: role.code }}
        aria-label={t('game.roleExplorer.viewDetails', {
          name: roleName,
          defaultValue: `View ${role.name} details`,
        })}
        className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
      />
    </Card>
  )
}

export function RoleExplorer() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<TeamFilter>('all')
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const visible =
    filter === 'all' ? ROLES : ROLES.filter((role) => role.role_type === filter)

  const updateArrows = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setCanScrollLeft(track.scrollLeft > 4)
    setCanScrollRight(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
    )
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (track) track.scrollLeft = 0
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [filter, updateArrows])

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: 'smooth',
    })
  }

  const filterLabel = (value: TeamFilter) =>
    value === 'all'
      ? t('game.roleExplorer.filters.all', { defaultValue: 'All roles' })
      : t(`game.teams.${value}`, {
          defaultValue: value === Team.MAFIA ? 'Mafia' : 'Town',
        })

  return (
    <section aria-labelledby="roles-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="text-center mb-10">
          <p className="island-kicker mb-3">
            {t('game.roleExplorer.kicker', { defaultValue: 'The Cast' })}
          </p>
          <h2
            id="roles-heading"
            className="display-title text-3xl sm:text-4xl text-neutral-900"
          >
            {t('game.roleExplorer.title', { defaultValue: 'Meet the roles' })}
          </h2>
          <p className="mt-4 text-base text-neutral-600 max-w-lg mx-auto leading-relaxed">
            {t('game.roleExplorer.subtitle', {
              defaultValue:
                'Your role is secret. Learn what everyone at the table might be plotting.',
            })}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t('game.roleExplorer.filterLabel', {
            defaultValue: 'Filter roles by team',
          })}
          className="flex items-center justify-center gap-2 mb-10"
        >
          {filterValues.map((value) => (
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
              {filterLabel(value)}
            </button>
          ))}
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            onScroll={updateArrows}
            role="region"
            aria-label={t('game.roleExplorer.regionLabel', {
              defaultValue: 'Roles',
            })}
            className="flex gap-6 overflow-x-auto snap-x pb-2 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {visible.map((role) => (
              <RoleCard key={role.code} role={role} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            aria-label={t('game.roleExplorer.scrollLeft', {
              defaultValue: 'Scroll roles left',
            })}
            className="absolute start-0 top-1/2 -translate-y-1/2 -translate-x-2 rtl:translate-x-2 flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-white shadow-md transition-opacity disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft
              className="w-5 h-5 rtl:rotate-180"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            aria-label={t('game.roleExplorer.scrollRight', {
              defaultValue: 'Scroll roles right',
            })}
            className="absolute end-0 top-1/2 -translate-y-1/2 translate-x-2 rtl:-translate-x-2 flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-white shadow-md transition-opacity disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRight
              className="w-5 h-5 rtl:rotate-180"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  )
}
