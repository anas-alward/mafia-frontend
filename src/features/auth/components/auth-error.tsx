interface AuthErrorProps {
  error: { code?: string; message: string; field?: string } | null
}

/** Maps API error codes to user-friendly messages for non-field errors */
function friendlyMessage(error: { code?: string; message: string }): string {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password.'
    case 'USERNAME_TAKEN':
      return 'This username is already registered.'
    case 'EMAIL_TAKEN':
      return 'This email is already registered.'
    case 'INVALID_RESET_TOKEN':
      return 'This reset link is invalid or has expired.'
    case 'INVALID_CURRENT_PASSWORD':
      return 'Current password is incorrect.'
    case 'SAME_PASSWORD':
      return 'New password must differ from the current password.'
    case 'VALIDATION_ERROR':
      return error.message
    default:
      return error.message || 'Something went wrong. Please try again.'
  }
}

export function AuthError({ error }: AuthErrorProps) {

  if (!error) return null

  return (
    <div
      role="alert"
      className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700"
    >
      {friendlyMessage(error)}
    </div>
  )
}
