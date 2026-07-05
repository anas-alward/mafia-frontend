import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ResetPasswordForm } from '#/features/auth/components/reset-password-form'
import type { ResetPasswordInput } from '#/features/auth/schemas/auth'
import { resetPassword } from '#/features/auth/api/client'
import type { ApiError } from '#/lib/api-client'

interface ResetPasswordSearch {
  token?: string
}

export const Route = createFileRoute('/(auth)/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = Route.useSearch()

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="display-title text-3xl text-neutral-900">Invalid link</h1>
          <p className="text-sm text-neutral-600">This password reset link is missing or invalid.</p>
          <button
            onClick={() => navigate({ to: '/forgot-password' })}
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
      const apiErr = err as ApiError
      if (apiErr.errors) return { errors: apiErr.errors }
      if (apiErr.message) return { errors: [{ message: apiErr.message }] }
      throw err
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="display-title text-3xl text-neutral-900">Set new password</h1>
          <p className="mt-2 text-sm text-neutral-600">Choose a new password for your account</p>
        </div>
        <ResetPasswordForm token={token} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
