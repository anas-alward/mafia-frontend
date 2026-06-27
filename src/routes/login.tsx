import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LoginForm } from '#/features/auth/components/login-form'
import type { LoginInput } from '#/features/auth/schemas/auth'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { login } from '#/features/auth/api/client'
import type { ApiError } from '#/lib/api-client'

interface LoginSearch {
  redirect?: string
  email?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    email: typeof search.email === 'string' ? search.email : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { redirect, email } = Route.useSearch()

  const handleSubmit = async (data: LoginInput) => {
    try {
      const result = await login(data)
      setAuth(result.user, result.access, result.refresh)
      await navigate({ to: redirect || '/dashboard' })
    } catch (err) {
      console.log("there was an error ", err)
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
          <h1 className="display-title text-3xl text-neutral-900">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-600">Log in to continue playing</p>
        </div>
        <LoginForm onSubmit={handleSubmit} defaultEmail={email} />
      </div>
    </div>
  )
}
