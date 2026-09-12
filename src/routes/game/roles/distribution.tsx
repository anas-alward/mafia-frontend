import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '#/components/ui/button'
import { RoleDistribution } from '#/features/game/components/role-distribution'

export const Route = createFileRoute('/game/roles/distribution')({
  component: RoleDistributionPage,
})

function RoleDistributionPage() {
  const { t } = useTranslation()
  return (
    <main>
      <section className="pt-20 pb-8 sm:pt-28 sm:pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="island-kicker mb-3">
            {t('game.pages.distribution.kicker', {
              defaultValue: 'Game · Roles · Distribution',
            })}
          </p>
          <h1 className="display-title text-4xl sm:text-5xl md:text-6xl text-neutral-900 leading-tight">
            {t('game.pages.distribution.title', {
              defaultValue: 'Who plays at your table size',
            })}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
            {t('game.pages.distribution.subtitle', {
              defaultValue:
                'Games run with 6 to 11 players. Pick a table size to see exactly which roles are dealt — shuffled, so anyone could be anything.',
            })}
          </p>
        </div>
      </section>

      <RoleDistribution />

      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="display-title text-2xl sm:text-3xl text-neutral-900">
            {t('game.pages.distribution.ctaTitle', {
              defaultValue: 'Done studying the odds?',
            })}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="text-white">
              <Link to="/">
                {t('game.pages.distribution.startPlaying', {
                  defaultValue: 'Start playing',
                })}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/game/roles">
                {t('game.pages.distribution.browseRoles', {
                  defaultValue: 'Browse all roles',
                })}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
