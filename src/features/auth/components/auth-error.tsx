import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

interface AuthErrorProps {
  error: { code?: string; message: string; field?: string } | null
}

/** Maps API error codes to user-friendly messages for non-field errors */
function friendlyMessage(
  t: TFunction,
  error: { code?: string; message: string },
): string {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      return t('auth.errors.invalidCredentials', {
        defaultValue: 'Invalid email or password.',
      })
    case 'USERNAME_TAKEN':
      return t('auth.errors.usernameTaken', {
        defaultValue: 'This username is already registered.',
      })
    case 'EMAIL_TAKEN':
      return t('auth.errors.emailTaken', {
        defaultValue: 'This email is already registered.',
      })
    case 'INVALID_RESET_TOKEN':
      return t('auth.errors.invalidResetToken', {
        defaultValue: 'This reset link is invalid or has expired.',
      })
    case 'INVALID_CURRENT_PASSWORD':
      return t('auth.errors.invalidCurrentPassword', {
        defaultValue: 'Current password is incorrect.',
      })
    case 'SAME_PASSWORD':
      return t('auth.errors.samePassword', {
        defaultValue: 'New password must differ from the current password.',
      })
    case 'VALIDATION_ERROR':
      // Server-provided message: pass through, translating only when known.
      return t('auth.errors.server', { defaultValue: error.message })
    default:
      return (
        t('auth.errors.server', { defaultValue: error.message }) ||
        t('auth.errors.generic', {
          defaultValue: 'Something went wrong. Please try again.',
        })
      )
  }
}

export function AuthError({ error }: AuthErrorProps) {
  const { t } = useTranslation()
  if (!error) return null

  return (
    <div
      role="alert"
      className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700"
    >
      {friendlyMessage(t, error)}
    </div>
  )
}
