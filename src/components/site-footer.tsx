import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer aria-label="Site footer" className="site-footer py-12 mt-24">
      <div className="page-wrap flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="display-title text-base text-neutral-900">
            Mafia
          </span>
          <span>&mdash; {t('footer.tagline')}</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/game/how-to-play" className="nav-link text-sm">
            {t('nav.howToPlay')}
          </Link>
          <a href="#game-mechanics" className="nav-link text-sm">
            {t('nav.mechanics')}
          </a>
          <a href="#join" className="nav-link text-sm">
            {t('nav.join')}
          </a>
        </div>

        <p className="text-xs text-neutral-500 opacity-60">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  )
}
