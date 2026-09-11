import { createFileRoute, Link } from '@tanstack/react-router'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'
import { Button } from '#/components/ui/button'
import { RoleExplorer } from '#/features/how-to-play/components/role-explorer'
import { GameFlow } from '#/features/how-to-play/components/game-flow'
import { WinConditions } from '#/features/how-to-play/components/win-conditions'
import { BeginnerTips } from '#/features/how-to-play/components/beginner-tips'

export const Route = createFileRoute('/how-to-play')({
  component: HowToPlayPage,
})

function HowToPlayPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="pt-20 pb-8 sm:pt-28 sm:pb-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="island-kicker mb-3">How To Play</p>
            <h1 className="display-title text-4xl sm:text-5xl md:text-6xl text-neutral-900 leading-tight">
              Trust no one. Suspect everyone.
            </h1>
            <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
              Mafia is a social deduction game for friends. Most of you are Town
              — but a few are secretly Mafia, eliminating players each night. By
              day, everyone debates and votes to root them out. Lie, deduce,
              survive.
            </p>
          </div>
        </section>

        <GameFlow />
        <RoleExplorer />
        <WinConditions />
        <BeginnerTips />

        <section className="py-16 sm:py-20 px-4">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <h2 className="display-title text-2xl sm:text-3xl text-neutral-900">
              Ready to play?
            </h2>
            <p className="text-base text-neutral-600">
              Create a room, invite your friends, and put your poker face on.
            </p>
            <Button asChild size="lg" className="text-white">
              <Link to="/">Start playing</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
