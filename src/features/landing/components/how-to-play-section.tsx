import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Skull, Users, Search, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { GameRole } from '../data/roles'
import { getAlignmentLabel } from '../data/roles'

const iconMap: Record<string, LucideIcon> = {
  skull: Skull,
  users: Users,
  search: Search,
  shield: Shield,
}

interface HowToPlaySectionProps {
  title: string
  description: string
  roles: GameRole[]
}

function RoleCard({ role }: { role: GameRole }) {
  const Icon = iconMap[role.icon]

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
            {getAlignmentLabel(role.alignment)}
          </Badge>
        </div>
        <CardTitle className="text-lg text-neutral-900">
          {role.name}
        </CardTitle>
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
            {role.nightAction}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function HowToPlaySection({
  title,
  description,
  roles,
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
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      </div>
    </section>
  )
}
