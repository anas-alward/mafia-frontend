import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'
import { HeroSection } from '#/features/landing/components/hero-section'
import { FaqSection } from '#/features/landing/components/faq-section'
import { GameFlow } from '#/features/how-to-play/components/game-flow'
import {
  CreateMeetingButton,
  JoinMeetingForm,
} from '#/features/rooms/components'
import { SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    // Root-only: every other page inherits the base tags, but og:url must
    // name the page actually being shared.
    meta: [{ property: 'og:url', content: SITE_URL }],
    links: [{ rel: 'canonical', href: SITE_URL }],
  }),
})

function Home() {
  const { t } = useTranslation()

  return (
    <>
      <SiteHeader />

      <main>
        <HeroSection
          headline={t('hero.headline')}
          subheadline={t('hero.subheadline')}
        >
          <div className="flex flex-col items-center gap-4">
            <CreateMeetingButton />
            <div className="flex items-center gap-4 w-full max-w-md">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-sm text-neutral-400">
                {t('hero.divider')}
              </span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
            <JoinMeetingForm />
            <a
              href="#how-to-play"
              className="text-sm text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
            >
              {t('hero.howToPlayLink')}
            </a>
          </div>
        </HeroSection>

        <GameFlow />

        <FaqSection />
      </main>

      <SiteFooter />
    </>
  )
}
