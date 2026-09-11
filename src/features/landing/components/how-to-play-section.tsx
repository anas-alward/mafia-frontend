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
import { ACTION_REGISTRY } from '#/features/game/constants/actions'
import { Phase } from '#/features/game/constants/phases'

interface HowToPlaySectionProps {
  title: string
  description: string
}

function getAlignmentLabel(roleType: Team): string {
  return roleType === Team.MAFIA ? 'Mafia' : 'Town'
}

function getNightAction(role: RoleDefinition): string {
  const nightActions = role.actions[Phase.NIGHT] ?? []
  if (nightActions.length === 0) return 'No night action'
  return nightActions
    .map((action) => ACTION_REGISTRY[action.action_type].label)
    .join(' + ')
}

function RoleCard({ role }: { role: RoleDefinition }) {
  const Icon = role.Icon

  return (
    <Card className="feature-card transition-colors group">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <Badge
            variant="secondary"
            className="text-[0.65rem] uppercase tracking-wider font-semibold"
          >
            {getAlignmentLabel(role.role_type)}
          </Badge>
        </div>
        <CardTitle className="text-lg text-neutral-900">{role.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm text-neutral-600 leading-relaxed">
          {role.description}
        </CardDescription>
        <div className="pt-3 border-t border-neutral-200">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Night Action
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {getNightAction(role)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function HowToPlaySection({
  title,
  description,
}: HowToPlaySectionProps) {
  return (
    <section id="how-to-play" className="py-20 sm:py-28 reveal-on-scroll">
      <div className="page-wrap">
        <div className="text-center mb-14">
          <p className="island-kicker mb-3">The Roles</p>
          <h2 className="display-title text-3xl sm:text-4xl md:text-5xl text-neutral-900">
            {title}
          </h2>
          <p className="mt-4 text-base text-neutral-600 max-w-lg mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES.map((role) => (
            <RoleCard key={role.code} role={role} />
          ))}
        </div>
      </div>
    </section>
  )
}
