import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ResetPasswordForm } from '#/features/auth/components/reset-password-form'
import type { ResetPasswordInput } from '#/features/auth/schemas/auth'
import { resetPassword } from '#/features/auth/api/client'
import { PasswordPageShell, toFormErrors } from './-shared'

interface ResetPasswordSearch {
  email?: string
  token?: string
}

export const Route = createFileRoute('/(auth)/password/reset')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    email: typeof search.email === 'string' ? search.email : undefined,
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { token, email } = search

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="display-title text-3xl text-neutral-900">
            Invalid link
          </h1>
          <p className="text-sm text-neutral-600">
            This password reset link is missing or invalid.
          </p>
          <button
            onClick={() => navigate({ to: '/password/forgot' })}
            className="text-sm text-neutral-900 underline underline-offset-2 font-medium"
          >
            Request a new reset link
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: ResetPasswordInput) => {
    try {
      await resetPassword(data)
      await navigate({ to: '/login' })
    } catch (err) {
      return toFormErrors(err)
    }
  }

  return (
    <PasswordPageShell
      title="Set new password"
      subtitle="Choose a new password for your account"
    >
      <ResetPasswordForm token={token} email={email} onSubmit={handleSubmit} />
    </PasswordPageShell>
  )
}
