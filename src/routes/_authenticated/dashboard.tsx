import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '#/features/auth/store/auth-store'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="max-w-lg">
      <h1 className="display-title text-4xl text-neutral-900">
        Welcome{user?.username ? `, ${user.username}` : ''}
      </h1>
      <p className="mt-4 text-neutral-600">
        You&apos;re signed in and ready to play. This is the authenticated dashboard.
      </p>
    </div>
  )
}
