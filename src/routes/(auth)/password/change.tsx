import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChangePasswordForm } from '#/features/auth/components/change-password-form'
import type { ChangePasswordInput } from '#/features/auth/schemas/auth'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { changePassword } from '#/features/auth/api/client'
import { PasswordPageShell, toFormErrors } from './-shared'

export const Route = createFileRoute('/(auth)/password/change')({
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
      return toFormErrors(err)
    }
  }

  return (
    <PasswordPageShell
      title="Change password"
      subtitle="Enter your current and new password"
    >
      <ChangePasswordForm onSubmit={handleSubmit} />
    </PasswordPageShell>
  )
}
