import { createFileRoute, Link } from '@tanstack/react-router'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'
import { HeroSection } from '#/features/landing/components/hero-section'
import { HowToPlaySection } from '#/features/landing/components/how-to-play-section'
import { GameMechanicsSection } from '#/features/landing/components/game-mechanics-section'
import {
  CreateMeetingButton,
  JoinMeetingForm,
} from '#/features/rooms/components'
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
        >
          <div className="flex flex-col items-center gap-4">
            <CreateMeetingButton />
            <div className="flex items-center gap-4 w-full max-w-md">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-sm text-neutral-400">or</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
            <JoinMeetingForm />
            <Link
              to="/game/how-to-play"
              className="text-sm text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
            >
              New here? Learn how to play
            </Link>
          </div>
        </HeroSection>

        <HowToPlaySection
          title="Choose Your Role"
          description="Every game assigns you a secret role with unique abilities. Your goal depends on which side you're on."
        />

        <GameMechanicsSection title="The Game Cycle" phases={phases} />
      </main>

      <SiteFooter />
    </>
  )
}
