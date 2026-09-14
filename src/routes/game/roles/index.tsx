import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '#/components/ui/button'
import { RoleExplorer } from '#/features/how-to-play/components/role-explorer'

export const Route = createFileRoute('/game/roles/')({
  component: GameRolesPage,
})

function GameRolesPage() {
  const { t } = useTranslation()
  return (
    <main>
      <section className="pt-20 pb-8 sm:pt-28 sm:pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="island-kicker mb-3">
            {t('game.pages.roles.kicker', { defaultValue: 'Game · Roles' })}
          </p>
          <h1 className="display-title text-4xl sm:text-5xl md:text-6xl text-neutral-900 leading-tight">
            {t('game.pages.roles.title', {
              defaultValue: 'Know every role at the table',
            })}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
            {t('game.pages.roles.subtitle', {
              defaultValue:
                'Every role and what it can do. Slide through the deck, filter by team, expand a card for abilities.',
            })}
          </p>
        </div>
      </section>

      <RoleExplorer />

      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="display-title text-2xl sm:text-3xl text-neutral-900">
            {t('game.pages.roles.ctaTitle', {
              defaultValue: 'Which roles appear in your game?',
            })}
          </h2>
          <p className="text-base text-neutral-600">
            {t('game.pages.roles.ctaText', {
              defaultValue:
                'The deal depends on your table size — see the exact composition for 6 to 11 players.',
            })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="text-white">
              <Link to="/game/roles/distribution">
                {t('game.pages.roles.seeDistribution', {
                  defaultValue: 'See role distribution',
                })}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/" hash="how-to-play">
                {t('game.pages.roles.readGuide', {
                  defaultValue: 'Read the guide',
                })}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
