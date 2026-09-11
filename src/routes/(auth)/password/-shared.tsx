import type { ReactNode } from 'react'
import type { ApiError } from '#/lib/api-client'

export function toFormErrors(err: unknown): {
  errors: { message: string; field?: string }[]
} | never {
  const apiErr = err as ApiError
  if (apiErr.errors) return { errors: apiErr.errors }
  if (apiErr.message) return { errors: [{ message: apiErr.message }] }
  throw err
}

export function PasswordPageShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="display-title text-3xl text-neutral-900">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
