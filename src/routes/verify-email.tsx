import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { VerifyEmailForm } from '#/features/auth/components/verify-email-form'
import { verifyEmail } from '#/features/auth/api/client'

import type { VerifyEmailInput } from '#/features/auth/schemas/auth'
import type { ApiError } from '#/lib/api-client'

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>) => {
    if (typeof search.email !== 'string' || !search.email.includes('@')) {
      throw redirect({ to: '/signup' })
    }
    return { email: search.email }
  },
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const navigate = useNavigate()
  const { email } = Route.useSearch()

  const handleVerify = async (data: VerifyEmailInput) => {
    try {
      await verifyEmail(data)
      await navigate({ to: '/login', search: { email } })
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
          <h1 className="display-title text-3xl text-neutral-900">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Enter the code sent to your email
          </p>
        </div>
        <VerifyEmailForm email={email} onSubmit={handleVerify} />
      </div>
    </div>
  )
}
