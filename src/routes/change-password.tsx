import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChangePasswordForm } from '#/features/auth/components/change-password-form'
import type { ChangePasswordInput } from '#/features/auth/schemas/auth'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { changePassword } from '#/features/auth/api/client'
import type { ApiError } from '#/lib/api-client'

export const Route = createFileRoute('/change-password')({
  component: ChangePasswordPage,
})

function ChangePasswordPage() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const handleSubmit = async (data: ChangePasswordInput) => {
    try {
      await changePassword(data)
      clearAuth()
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
          <h1 className="display-title text-3xl text-neutral-900">Change password</h1>
          <p className="mt-2 text-sm text-neutral-600">Enter your current and new password</p>
        </div>
        <ChangePasswordForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
