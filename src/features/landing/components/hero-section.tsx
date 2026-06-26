import { ChevronDown } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface HeroSectionProps {
  headline: string
  subheadline: string
  ctaLabel: string
  ctaHref: string
}

export function HeroSection({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4">
      <div className="rise-in max-w-3xl mx-auto">
        <h1 className="display-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-neutral-900 leading-tight">
          {headline}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-neutral-600 max-w-xl mx-auto leading-relaxed">
          {subheadline}
        </p>

        <div className="mt-10">
          <Button
            asChild
            size="lg"
            className="cta-glow text-white text-base px-8 py-6 rounded-xl shadow-none"
          >
            <a href={ctaHref}>{ctaLabel}</a>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 motion-safe:animate-bounce">
        <ChevronDown
          className="w-6 h-6 text-neutral-400"
          aria-hidden="true"
        />
      </div>
    </section>
  )
}
