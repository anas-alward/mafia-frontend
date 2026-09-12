import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

interface FaqItem {
  q: string
  a: string
}

export function FaqSection() {
  const { t } = useTranslation()
  const faqs = t('faq.items', { returnObjects: true }) as unknown as FaqItem[]

  return (
    <section aria-labelledby="faq-heading" className="py-20 sm:py-28">
      <div className="page-wrap">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <p className="island-kicker mb-3">{t('faq.kicker')}</p>
            <h2
              id="faq-heading"
              className="display-title text-3xl sm:text-4xl text-neutral-900"
            >
              {t('faq.title')}
            </h2>
          </div>

          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <span className="font-semibold text-neutral-900">{q}</span>
                  <Plus
                    className="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed pe-8">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
