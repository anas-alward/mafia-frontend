import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'
import { HeroSection } from '#/features/landing/components/hero-section'
import { FaqSection } from '#/features/landing/components/faq-section'
import {
  CreateMeetingButton,
  JoinMeetingForm,
} from '#/features/rooms/components'

export const Route = createFileRoute('/')({ component: Home })

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
            <Link
              to="/game/how-to-play"
              className="text-sm text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
            >
              {t('hero.howToPlayLink')}
            </Link>
          </div>
        </HeroSection>

        <FaqSection />
      </main>

      <SiteFooter />
    </>
  )
}
