import { createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'
import { HeroSection } from '#/features/landing/components/hero-section'
import { HowToPlaySection } from '#/features/landing/components/how-to-play-section'
import { GameMechanicsSection } from '#/features/landing/components/game-mechanics-section'
import { CtaSection } from '#/features/landing/components/cta-section'
import { roles } from '#/features/landing/data/roles'
import { phases } from '#/features/landing/data/phases'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <HeroSection
          headline="Deceive. Deduce. Survive."
          subheadline="Mafia is the ultimate social deduction game where trust is your weapon and lies are your shield. Play online with friends — who will you believe?"
          ctaLabel="Join the Waitlist"
          ctaHref="#join"
        />

        <HowToPlaySection
          title="Choose Your Role"
          description="Every game assigns you a secret role with unique abilities. Your goal depends on which side you're on."
          roles={roles}
        />

        <GameMechanicsSection title="The Game Cycle" phases={phases} />

        <CtaSection
          title="Ready to Play?"
          description="The game is launching soon. Join the waitlist to be the first to know when Mafia goes live."
          ctaLabel="Join the Waitlist"
          ctaHref="#join"
        />
      </main>

      <SiteFooter />
    </>
  )
}
