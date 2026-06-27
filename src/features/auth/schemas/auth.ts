import { z } from 'zod'

// Shared field validators
const username = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens',
  )

const email = z.string().email('Please enter a valid email address')

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')

// ── Sign Up ──
export const signUpSchema = z.object({
  username,
  email,
  password,
})

export type SignUpInput = z.infer<typeof signUpSchema>

// ── Login ──
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ── Verify Email ──
export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().min(1, 'Verification code is required'),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

// ── Forgot Password ──
export const forgotPasswordSchema = z.object({
  email,
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

// ── Reset Password ──
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password,
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// ── Change Password ──
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: password,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must differ from current password',
    path: ['newPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
