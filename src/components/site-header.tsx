import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { logout } from '#/features/auth/api/client'

const navItems = [
  { label: 'How to Play', href: '#how-to-play' },
  { label: 'Game Mechanics', href: '#game-mechanics' },
] as const

export function SiteHeader() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="page-wrap flex items-center justify-between h-16">
        <Link
          to="/"
          className="display-title text-xl text-neutral-900 no-underline tracking-tight"
        >
          Mafia
        </Link>

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
          {isLoading ? null : isAuthenticated && user ? (
            <>
              <span className="text-sm text-neutral-600 hidden sm:inline">
                {user.username}
              </span>
              <Link
                to="/change-password"
                className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-2 hidden sm:inline"
              >
                Change password
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await logout()
                  } catch {
                    // Proceed with local logout even if Django call fails
                  }
                  clearAuth()
                  window.location.href = '/'
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="cta-glow text-white shadow-none"
              >
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
