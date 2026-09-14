import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '#/components/ui/button'
import { ActionGlossary } from '#/features/how-to-play/components/action-glossary'

export const Route = createFileRoute('/game/actions')({
  component: GameActionsPage,
})

function GameActionsPage() {
  const { t } = useTranslation()
  return (
    <main>
      <section className="pt-20 pb-8 sm:pt-28 sm:pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="island-kicker mb-3">
            {t('game.pages.actions.kicker', { defaultValue: 'Game · Actions' })}
          </p>
          <h1 className="display-title text-4xl sm:text-5xl md:text-6xl text-neutral-900 leading-tight">
            {t('game.pages.actions.title', {
              defaultValue: 'Every move in the game',
            })}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
            {t('game.pages.actions.subtitle', {
              defaultValue:
                'All the actions — who can use them, in which phase, and what the village sees when they land.',
            })}
          </p>
        </div>
      </section>

      <ActionGlossary />

      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="display-title text-2xl sm:text-3xl text-neutral-900">
            {t('game.pages.actions.ctaTitle', {
              defaultValue: 'Know the moves? Learn the flow',
            })}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="text-white">
              <Link to="/" hash="how-to-play">
                {t('game.pages.actions.readGuide', {
                  defaultValue: 'Read the guide',
                })}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/game/roles">
                {t('game.pages.actions.browseRoles', {
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
