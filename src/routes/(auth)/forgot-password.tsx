import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ForgotPasswordForm } from '#/features/auth/components/forgot-password-form'
import type {ForgotPasswordInput} from '#/features/auth/schemas/auth';
import { forgotPassword } from '#/features/auth/api/client'

export const Route = createFileRoute('/(auth)/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [result, setResult] = useState<{ resetLink: string | null } | null>(null)

  const handleSubmit = async (_data: ForgotPasswordInput) => {
    try {
      const res = await forgotPassword(_data)
      setResult({ resetLink: res.data.resetLink || null })
    } catch {
      // FR-016: Always show success even on error
      setResult({ resetLink: null })
    }
    return { success: true }
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="display-title text-3xl text-neutral-900">Check your email</h1>
          <p className="text-sm text-neutral-600">
            If an account with that email exists, we&apos;ve sent a password reset link.
          </p>
          {result.resetLink && (
            <div className="rounded-md bg-neutral-50 border border-neutral-200 p-4 text-left">
              <p className="text-xs text-neutral-500 mb-1">Development link:</p>
              <a href={result.resetLink} className="text-sm text-neutral-900 underline break-all">
                {result.resetLink}
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="display-title text-3xl text-neutral-900">Reset your password</h1>
          <p className="mt-2 text-sm text-neutral-600">Enter your email to receive a reset link</p>
        </div>
        <ForgotPasswordForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
