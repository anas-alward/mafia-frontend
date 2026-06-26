import { Button } from '#/components/ui/button'

const navItems = [
  { label: 'How to Play', href: '#how-to-play' },
  { label: 'Game Mechanics', href: '#game-mechanics' },
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="page-wrap flex items-center justify-between h-16">
        <a
          href="#"
          className="display-title text-xl text-neutral-900 no-underline tracking-tight"
        >
          Mafia
        </a>

        <nav
          aria-label="Main navigation"
          className="hidden sm:flex items-center gap-8"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="nav-link text-sm font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button
            asChild
            size="sm"
            className="cta-glow text-white shadow-none"
          >
            <a href="#join">Join the Game</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
