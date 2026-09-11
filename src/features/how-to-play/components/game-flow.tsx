import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ROLES } from '#/features/game/constants/roles'
import { ACTION_REGISTRY, ActionType } from '#/features/game/constants/actions'
import { PHASE_META, Phase } from '#/features/game/constants/phases'
import {
  Link2,
  MoonStar,
  MessagesSquare,
  Vote,
  Repeat,
  Crown,
} from 'lucide-react'

const steps = [
  {
    Icon: Link2,
    title: 'Gather your crew',
    text: 'The host creates a room and shares the invite link or room code. Everyone joins from their browser — no installs, just audio, video, and suspicion.',
  },
  {
    Icon: MoonStar,
    title: 'Roles are dealt in secret',
    text: 'Each player is assigned a hidden role: most are Town, a few are Mafia. Look at your own role and tell no one. The Mafia learn who each other are — the Town knows nothing.',
  },
  {
    Icon: MoonStar,
    title: 'Night falls — roles act',
    text: 'When night comes, each role with a night ability acts in secret: the Mafia pick a target, the Detective investigates a suspect, the Doctor protects someone. Switch to the Night tab below to see who does what.',
  },
  {
    Icon: MessagesSquare,
    title: 'Morning — the reveal',
    text: "Everyone wakes up to the news: someone may have been eliminated overnight — unless the Doctor made a save. The eliminated player's role is revealed.",
  },
  {
    Icon: MessagesSquare,
    title: 'Discuss and accuse',
    text: 'The living debate. Who acted suspiciously? Who is deflecting? Town players share what they know (carefully), and Mafia players blend in, sow doubt, and push suspicion onto innocents.',
  },
  {
    Icon: Vote,
    title: 'Vote to eliminate',
    text: 'Everyone casts a vote. The player with the most votes is eliminated and their role is revealed. Then night falls again — repeat until one side wins.',
  },
  {
    Icon: Crown,
    title: 'A side claims victory',
    text: 'Town wins by eliminating every Mafia member. Mafia wins once they match the Town in numbers and control the vote. See the win conditions below.',
  },
]

const phaseOrder: Phase[] = [Phase.NIGHT, Phase.DAY, Phase.VOTE_RESULT]

const phaseDescriptions: Record<Phase, string> = {
  [Phase.NIGHT]:
    'The village sleeps. Players with night abilities act one by one, in secret. Nobody sees who chose whom — only the outcomes surface in the morning.',
  [Phase.DAY]:
    'The village wakes and talks. Everyone discusses the events of the night, shares suspicions, and defends themselves. The Vigilante may spend a bullet instead of voting — but shooting a Town player backfires.',
  [Phase.VOTE_RESULT]:
    'Discussion ends and every living player votes. The top suspect is eliminated and their role is revealed for all to see. If the Crimson Kamikaze dies, they take their killer down with them.',
}

/** Roles with a non-vote action in the given phase. */
function actingRoles(phase: Phase): string[] {
  return ROLES.filter((role) =>
    (role.actions[phase] ?? []).some(
      (action) => action.action_type !== ActionType.VOTE,
    ),
  ).map((role) => role.name)
}

function actingActionLabels(phase: Phase): string {
  const labels = new Set<string>()
  for (const role of ROLES) {
    for (const action of role.actions[phase] ?? []) {
      if (action.action_type !== ActionType.VOTE) {
        labels.add(ACTION_REGISTRY[action.action_type].label)
      }
    }
  }
  return [...labels].join(' · ')
}

export function GameFlow() {
  const [activePhase, setActivePhase] = useState<Phase>(Phase.NIGHT)

  return (
    <section aria-labelledby="flow-heading" className="py-16 sm:py-20">
      <div className="page-wrap">
        <div className="text-center mb-12">
          <p className="island-kicker mb-3">Start To Finish</p>
          <h2
            id="flow-heading"
            className="display-title text-3xl sm:text-4xl text-neutral-900"
          >
            How a game unfolds
          </h2>
          <p className="mt-4 text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            One game is a loop of nights and days. Here is the full journey,
            then explore what happens inside each phase.
          </p>
        </div>

        <ol className="max-w-3xl mx-auto space-y-4 mb-16">
          {steps.map(({ Icon, title, text }, index) => (
            <li key={title} className="flex gap-4 items-start">
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
                  <span className="text-neutral-400 mr-2">{index + 1}.</span>
                  {title}
                </p>
                <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="max-w-3xl mx-auto">
          <div
            role="tablist"
            aria-label="Explore each phase"
            className="flex items-center justify-center gap-2 mb-6"
          >
            {phaseOrder.map((phase) => {
              const PhaseIcon = PHASE_META[phase].Icon
              return (
                <button
                  key={phase}
                  role="tab"
                  aria-selected={activePhase === phase}
                  onClick={() => setActivePhase(phase)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activePhase === phase
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <PhaseIcon className="w-4 h-4" aria-hidden="true" />
                  {PHASE_META[phase].label}
                </button>
              )
            })}
          </div>

          <Card className="feature-card">
            <CardHeader>
              <CardTitle className="text-xl text-neutral-900">
                {PHASE_META[activePhase].label} phase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm text-neutral-600 leading-relaxed">
                {phaseDescriptions[activePhase]}
              </CardDescription>
              <div className="pt-3 border-t border-neutral-200">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Who acts
                </p>
                <p className="text-sm text-neutral-900">
                  {actingRoles(activePhase).join(', ') || 'All players'}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Actions:{' '}
                  {actingActionLabels(activePhase) || 'Discussion + vote'}
                </p>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
                Night, day, and vote repeat until a side wins.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
