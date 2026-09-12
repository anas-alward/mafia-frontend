import { Plus } from 'lucide-react'

const faqs = [
  {
    question: 'How many players do we need?',
    answer:
      'Six to eleven. Roles are dealt to fit your table, so a small group and a full house both get a proper game.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'Yes — everyone signs up first. Then one person creates a room and the rest join with the invite link or room code.',
  },
  {
    question: 'How do my friends join?',
    answer:
      'Send them your invite link or room code. They join from their browser, and the host lets them in. No installs, no downloads.',
  },
  {
    question: 'Do I need a camera or microphone?',
    answer:
      'They run right in the browser, and you can toggle either before joining. Mafia is a talking game though — mic on is strongly advised.',
  },
  {
    question: 'What happens when I get eliminated?',
    answer:
      'You stay and watch. The fallen gather in the graveyard strip while the living keep arguing — perfect for backseat suspecting.',
  },
  {
    question: 'How long does a game take?',
    answer:
      'Rounds of night, day, and voting repeat until one side wins. Most games wrap up in minutes, not hours.',
  },
]

export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="py-20 sm:py-28">
      <div className="page-wrap">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <p className="island-kicker mb-3">Before you sit down</p>
            <h2
              id="faq-heading"
              className="display-title text-3xl sm:text-4xl text-neutral-900"
            >
              Fair questions
            </h2>
          </div>

          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <span className="font-semibold text-neutral-900">
                    {question}
                  </span>
                  <Plus
                    className="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed pr-8">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
