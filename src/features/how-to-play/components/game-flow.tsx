import { Link2, MoonStar, MessagesSquare, Vote, Crown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

const steps: { Icon: LucideIcon; key: string; title: string; text: string }[] =
  [
    {
      Icon: Link2,
      key: 'gather',
      title: 'Gather your crew',
      text: 'The host creates a room and shares the invite link or room code. Everyone joins from their browser — no installs, just audio, video, and suspicion.',
    },
    {
      Icon: MoonStar,
      key: 'roles',
      title: 'Roles are dealt in secret',
      text: 'Each player is assigned a hidden role: most are Town, a few are Mafia. Look at your own role and tell no one. The Mafia learn who each other are — the Town knows nothing.',
    },
    {
      Icon: MoonStar,
      key: 'night',
      title: 'Night falls — roles act',
      text: 'When night comes, each role with a night ability acts in secret: the Mafia pick a target, the Detective investigates a suspect, the Doctor protects someone. See the phases page for who does what.',
    },
    {
      Icon: MessagesSquare,
      key: 'morning',
      title: 'Morning — the reveal',
      text: "Everyone wakes up to the news: someone may have been eliminated overnight — unless the Doctor made a save. The eliminated player's role is revealed.",
    },
    {
      Icon: MessagesSquare,
      key: 'discuss',
      title: 'Discuss and accuse',
      text: 'The living debate. Who acted suspiciously? Who is deflecting? Town players share what they know (carefully), and Mafia players blend in, sow doubt, and push suspicion onto innocents.',
    },
    {
      Icon: Vote,
      key: 'vote',
      title: 'Vote to eliminate',
      text: 'Everyone casts a vote. The player with the most votes is eliminated and their role is revealed. Then night falls again — repeat until one side wins.',
    },
    {
      Icon: Crown,
      key: 'victory',
      title: 'A side claims victory',
      text: 'Town wins by eliminating every Mafia member. Mafia wins once they match the Town in numbers and control the vote. See the win conditions below.',
    },
  ]

export function GameFlow() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="flow-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="text-center mb-12">
          <p className="island-kicker mb-3">
            {t('game.howToPlay.flow.kicker', {
              defaultValue: 'Start To Finish',
            })}
          </p>
          <h2
            id="flow-heading"
            className="display-title text-3xl sm:text-4xl text-neutral-900"
          >
            {t('game.howToPlay.flow.title', {
              defaultValue: 'How a game unfolds',
            })}
          </h2>
          <p className="mt-4 text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            {t('game.howToPlay.flow.introA', {
              defaultValue:
                'One game is a loop of nights and days. Here is the full journey —',
            })}{' '}
            <Link
              to="/game/phases"
              className="underline underline-offset-4 hover:text-neutral-900"
            >
              {t('game.howToPlay.flow.introLink', {
                defaultValue: 'explore what happens inside each phase',
              })}
            </Link>
            .
          </p>
        </div>

        <ol className="max-w-3xl mx-auto space-y-4 mb-16">
          {steps.map(({ Icon, key, title, text }, index) => (
            <li key={key} className="flex gap-4 items-start">
              <div className="flex flex-col items-center shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-white">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className="w-px flex-1 min-h-6 bg-neutral-200 my-1"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="pb-2">
                <p className="font-semibold text-neutral-900">
                  <span className="text-neutral-400 me-2">{index + 1}.</span>
                  {t(`game.howToPlay.flow.steps.${key}.title`, {
                    defaultValue: title,
                  })}
                </p>
                <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                  {t(`game.howToPlay.flow.steps.${key}.text`, {
                    defaultValue: text,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
