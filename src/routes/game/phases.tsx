import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '#/components/ui/button'
import { PhaseExplorer } from '#/features/how-to-play/components/phase-explorer'

export const Route = createFileRoute('/game/phases')({
  component: GamePhasesPage,
})

function GamePhasesPage() {
  const { t } = useTranslation()
  return (
    <main>
      <section className="pt-20 pb-8 sm:pt-28 sm:pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="island-kicker mb-3">
            {t('game.pages.phases.kicker', { defaultValue: 'Game · Phases' })}
          </p>
          <h1 className="display-title text-4xl sm:text-5xl md:text-6xl text-neutral-900 leading-tight">
            {t('game.pages.phases.title', {
              defaultValue: 'Night, day, repeat',
            })}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
            {t('game.pages.phases.subtitle', {
              defaultValue:
                'Every round cycles through the same phases. Explore each one — what happens, who acts, and which actions resolve.',
            })}
          </p>
        </div>
      </section>

      <PhaseExplorer />

      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="display-title text-2xl sm:text-3xl text-neutral-900">
            {t('game.pages.phases.ctaTitle', {
              defaultValue: 'Know the rhythm? Learn the flow',
            })}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="text-white">
              <Link to="/" hash="how-to-play">
                {t('game.pages.phases.readGuide', {
                  defaultValue: 'Read the guide',
                })}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/game/actions">
                {t('game.pages.phases.seeActions', {
                  defaultValue: 'See every action',
                })}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
