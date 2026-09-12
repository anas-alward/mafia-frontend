import { createFileRoute } from '@tanstack/react-router'
import { GameFlow } from '#/features/how-to-play/components/game-flow'

export const Route = createFileRoute('/game/how-to-play')({
  component: HowToPlayPage,
})

function HowToPlayPage() {
  return (
    <main>
      <GameFlow />
    </main>
  )
}
