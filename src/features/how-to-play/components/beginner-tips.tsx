import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Eye,
  Ghost,
  Lightbulb,
  MessagesSquare,
  NotebookPen,
  Search,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const tips: { Icon: LucideIcon; key: string; title: string; text: string }[] = [
  {
    Icon: NotebookPen,
    key: 'track',
    title: 'Track everything',
    text: 'Note who voted for whom and who pushed each elimination. Mafia voting patterns leak over time — the record rarely lies.',
  },
  {
    Icon: MessagesSquare,
    key: 'speak',
    title: 'Town: speak up, but time it',
    text: 'Share what you know during discussion. If you hold a power role, hint instead of claiming outright — the Mafia is listening.',
  },
  {
    Icon: Ghost,
    key: 'blend',
    title: "Mafia: blend, don't hide",
    text: 'Silent players look suspicious. Accuse, defend, and vote like a Town member would — and never let your partners look coordinated.',
  },
  {
    Icon: Search,
    key: 'detective',
    title: 'Detective: protect your findings',
    text: 'Found a Mafia member? Steer the vote toward them without exposing how you know. A revealed Detective rarely survives the next night.',
  },
  {
    Icon: Eye,
    key: 'doctor',
    title: 'Doctor: guard the valuable',
    text: 'Protect outspoken Town voices and confirmed power roles. Avoid obvious patterns — the Mafia watches who keeps surviving.',
  },
  {
    Icon: Lightbulb,
    key: 'quiet',
    title: 'Everyone: watch the quiet ones',
    text: 'Players coasting through discussion without committing to reads are often hiding something. Ask them direct questions.',
  },
]

export function BeginnerTips() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="tips-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="text-center mb-10">
          <p className="island-kicker mb-3">
            {t('game.beginnerTips.kicker', { defaultValue: 'Play Smarter' })}
          </p>
          <h2
            id="tips-heading"
            className="display-title text-3xl sm:text-4xl text-neutral-900"
          >
            {t('game.beginnerTips.title', { defaultValue: 'Beginner tips' })}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tips.map(({ Icon, key, title, text }) => (
            <Card key={key} className="feature-card">
              <CardHeader>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900 mb-2">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-base text-neutral-900">
                  {t(`game.beginnerTips.tips.${key}.title`, {
                    defaultValue: title,
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-neutral-600 leading-relaxed">
                  {t(`game.beginnerTips.tips.${key}.text`, {
                    defaultValue: text,
                  })}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
