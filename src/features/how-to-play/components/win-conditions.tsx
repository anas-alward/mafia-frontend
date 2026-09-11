import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Sun, Skull } from 'lucide-react'

const conditions = [
  {
    Icon: Sun,
    side: 'Town wins',
    headline: 'Eliminate every Mafia member',
    text: 'The Town — everyone who is not Mafia — wins when the last Mafia player is eliminated, whether by day vote, Vigilante shot, or Kamikaze explosion. Every revealed role is a clue: count down the remaining suspects.',
  },
  {
    Icon: Skull,
    side: 'Mafia wins',
    headline: 'Reach parity with the Town',
    text: 'The Mafia wins once their numbers match the surviving Town — at parity they control every vote, so the outcome is sealed. Kill quietly at night, deflect by day, and survive the eliminations.',
  },
]

export function WinConditions() {
  return (
    <section aria-labelledby="win-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="text-center mb-10">
          <p className="island-kicker mb-3">The Stakes</p>
          <h2
            id="win-heading"
            className="display-title text-3xl sm:text-4xl text-neutral-900"
          >
            How each side wins
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {conditions.map(({ Icon, side, headline, text }) => (
            <Card key={side} className="feature-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-900 text-white">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    {side}
                  </p>
                </div>
                <CardTitle className="text-xl text-neutral-900">
                  {headline}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-neutral-600 leading-relaxed">
                  {text}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
