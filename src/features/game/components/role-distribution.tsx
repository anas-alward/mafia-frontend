import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import {
  ROLE_COMPOSITIONS,
  SUPPORTED_PLAYER_COUNTS,
} from '#/features/game/constants/distribution'
import { Team, getRoleDefinition } from '#/features/game/constants/roles'

interface CompositionEntry {
  code: string
  count: number
}

function groupComposition(playerCount: number): CompositionEntry[] {
  const counts = new Map<string, number>()
  for (const code of ROLE_COMPOSITIONS[playerCount] ?? []) {
    counts.set(code, (counts.get(code) ?? 0) + 1)
  }
  return [...counts.entries()].map(([code, count]) => ({ code, count }))
}

function teamSplit(playerCount: number): { town: number; mafia: number } {
  let town = 0
  let mafia = 0
  for (const code of ROLE_COMPOSITIONS[playerCount] ?? []) {
    if (getRoleDefinition(code)?.role_type === Team.MAFIA) mafia += 1
    else town += 1
  }
  return { town, mafia }
}

export function RoleDistribution() {
  const [playerCount, setPlayerCount] = useState<number>(
    SUPPORTED_PLAYER_COUNTS[0],
  )
  const entries = groupComposition(playerCount)
  const { town, mafia } = teamSplit(playerCount)

  return (
    <section aria-labelledby="distribution-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="text-center mb-10">
          <p className="island-kicker mb-3">The Deal</p>
          <h2
            id="distribution-heading"
            className="display-title text-3xl sm:text-4xl text-neutral-900"
          >
            Roles at every table size
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Filter by player count"
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
        >
          {SUPPORTED_PLAYER_COUNTS.map((count) => (
            <button
              key={count}
              role="tab"
              aria-selected={playerCount === count}
              onClick={() => setPlayerCount(count)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                playerCount === count
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {count} players
            </button>
          ))}
        </div>

        <Card className="feature-card max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl text-neutral-900">
              {playerCount} players: {town} Town vs {mafia} Mafia
            </CardTitle>
            <CardDescription className="text-sm text-neutral-600">
              The Mafia is always outnumbered — their edge is secrecy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-neutral-200">
              {entries.map(({ code, count }) => {
                const role = getRoleDefinition(code)
                if (!role) return null
                const Icon = role.Icon
                return (
                  <li
                    key={code}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-100 text-neutral-900 shrink-0">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium text-neutral-900 flex-1">
                      {role.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[0.65rem] uppercase tracking-wider font-semibold"
                    >
                      {role.role_type === Team.MAFIA ? 'Mafia' : 'Town'}
                    </Badge>
                    <span className="text-sm font-bold text-neutral-900 w-8 text-right">
                      ×{count}
                    </span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
