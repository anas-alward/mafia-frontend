import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

interface CtaSectionProps {
  title: string
  description: string
}

export function CtaSection({ title, description }: CtaSectionProps) {
  return (
    <section id="join" className="py-20 sm:py-28 reveal-on-scroll">
      <div className="page-wrap">
        <div className="island-shell rounded-2xl p-10 sm:p-16 text-center max-w-2xl mx-auto">
          <h2 className="display-title text-3xl sm:text-4xl text-neutral-900">
            {title}
          </h2>
          <p className="mt-4 text-base text-neutral-600 max-w-md mx-auto leading-relaxed">
            {description}
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="lg" className="cta-glow text-white text-base px-8 py-6 rounded-xl shadow-none">
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
