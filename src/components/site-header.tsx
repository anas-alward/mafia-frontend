import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { logout } from '#/features/auth/api/client'
import { KeyRound, LogOut } from 'lucide-react'

function getInitials(username: string): string {
  return username
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

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

        <div className="flex items-center gap-4">
          {isLoading ? null : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-neutral-200 text-neutral-700 text-xs font-medium">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-neutral-900">
                      {user.username}
                    </p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/change-password">
                    <KeyRound className="h-4 w-4 mr-2" />
                    Change Password
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
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
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
