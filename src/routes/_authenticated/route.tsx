import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { SiteHeader } from '#/components/site-header.tsx'

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


function AuthenticatedLayout() {

  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
