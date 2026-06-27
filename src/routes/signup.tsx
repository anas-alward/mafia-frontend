import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SignUpForm } from '#/features/auth/components/sign-up-form'
import type { SignUpInput } from '#/features/auth/schemas/auth'
import { signUp } from '#/features/auth/api/client'
import type { ApiError } from '#/lib/api-client'

export const Route = createFileRoute('/signup')({
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()

  const handleSubmit = async (data: SignUpInput) => {
    try {
      await signUp(data)
      await navigate({ to: '/verify-email', search: { email: data.email } })
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
          <h1 className="display-title text-3xl text-neutral-900">Create an account</h1>
          <p className="mt-2 text-sm text-neutral-600">Start your Mafia journey</p>
        </div>
        <SignUpForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
