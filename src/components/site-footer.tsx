export function SiteFooter() {
  return (
    <footer aria-label="Site footer" className="site-footer py-12 mt-24">
      <div className="page-wrap flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="display-title text-base text-neutral-900">
            Mafia
          </span>
          <span>&mdash; Social Deduction Online</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#how-to-play" className="nav-link text-sm">
            How to Play
          </a>
          <a href="#game-mechanics" className="nav-link text-sm">
            Mechanics
          </a>
          <a href="#join" className="nav-link text-sm">
            Join
          </a>
        </div>

        <p className="text-xs text-neutral-500 opacity-60">
          &copy; {new Date().getFullYear()} Mafia. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
