import { createFileRoute, redirect, Outlet, useLocation, Link } from '@tanstack/react-router'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { KeyRound, LogOut } from 'lucide-react'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isLoading } = useAuthStore.getState()
    if (!isAuthenticated && !isLoading) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})

const pageTitles: Record<string, string> = {
  '/change-password': 'Change Password',
}

function getPageTitle(pathname: string): string | null {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (/^\/rooms\/[^/]+$/.test(pathname)) return 'Meeting Room'
  return null
}

function getInitials(username: string): string {
  return username
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function AuthenticatedLayout() {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-white px-6">
        <div className="flex items-center gap-3">
          <Link to="/rooms" className="text-lg font-bold tracking-tight text-neutral-900">
            Mafia
          </Link>
          {pageTitle && (
            <>
              <span className="text-neutral-300">/</span>
              <h1 className="text-sm font-medium text-neutral-600">
                {pageTitle}
              </h1>
            </>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-neutral-200 text-neutral-700 text-xs font-medium">
                {user ? getInitials(user.username) : '?'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.username}
                </p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
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
              onClick={() => {
                clearAuth()
                window.location.href = '/'
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
