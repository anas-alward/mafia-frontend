import { z } from 'zod'
import type { TFunction } from 'i18next'

// Shared field validators (per-language: call inside a factory with `t`)
function usernameValidator(t: TFunction) {
  return z
    .string()
    .min(
      3,
      t('auth.validation.usernameMin', {
        defaultValue: 'Username must be at least 3 characters',
      }),
    )
    .max(
      30,
      t('auth.validation.usernameMax', {
        defaultValue: 'Username must be at most 30 characters',
      }),
    )
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      t('auth.validation.usernamePattern', {
        defaultValue:
          'Username can only contain letters, numbers, underscores, and hyphens',
      }),
    )
}

function emailValidator(t: TFunction) {
  return z.string().email(
    t('auth.validation.emailInvalid', {
      defaultValue: 'Please enter a valid email address',
    }),
  )
}

function passwordValidator(t: TFunction) {
  return z.string().min(
    8,
    t('auth.validation.passwordMin', {
      defaultValue: 'Password must be at least 8 characters',
    }),
  )
}

function confirmPasswordValidator(t: TFunction) {
  return z.string().min(
    1,
    t('auth.validation.confirmRequired', {
      defaultValue: 'Please confirm your password',
    }),
  )
}

function passwordMismatchMessage(t: TFunction) {
  return t('auth.validation.passwordMismatch', {
    defaultValue: 'Passwords do not match',
  })
}

// ── Sign Up ──
export function createSignUpSchema(t: TFunction) {
  return z.object({
    username: usernameValidator(t),
    email: emailValidator(t),
    password: passwordValidator(t),
  })
}

export type SignUpInput = z.infer<ReturnType<typeof createSignUpSchema>>

/** Form-level schema: double-checks the password before submission. */
export function createSignUpFormSchema(t: TFunction) {
  return z
    .object({
      username: usernameValidator(t),
      email: emailValidator(t),
      password: passwordValidator(t),
      confirmPassword: confirmPasswordValidator(t),
    })
    .refine((data) => data.confirmPassword === data.password, {
      message: passwordMismatchMessage(t),
      path: ['confirmPassword'],
    })
}

export type SignUpFormInput = z.infer<ReturnType<typeof createSignUpFormSchema>>

// ── Login ──
export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z
      .string()
      .min(
        1,
        t('auth.validation.emailRequired', {
          defaultValue: 'Email is required',
        }),
      )
      .email(
        t('auth.validation.emailInvalid', {
          defaultValue: 'Please enter a valid email address',
        }),
      ),
    password: z.string().min(
      1,
      t('auth.validation.passwordRequired', {
        defaultValue: 'Password is required',
      }),
    ),
  })
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>

// ── Verify Email ──
export function createVerifyEmailSchema(t: TFunction) {
  return z.object({
    email: z.string().email(),
    code: z.string().min(
      1,
      t('auth.validation.codeRequired', {
        defaultValue: 'Verification code is required',
      }),
    ),
  })
}

export type VerifyEmailInput = z.infer<
  ReturnType<typeof createVerifyEmailSchema>
>

// ── Forgot Password ──
export function createForgotPasswordSchema(t: TFunction) {
  return z.object({
    email: emailValidator(t),
  })
}

export type ForgotPasswordInput = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>

// ── Reset Password ──
export function createResetPasswordSchema(t: TFunction) {
  return z.object({
    token: z.string().min(
      1,
      t('auth.validation.tokenRequired', {
        defaultValue: 'Reset token is required',
      }),
    ),
    email: emailValidator(t),
    newPassword: passwordValidator(t),
  })
}

export type ResetPasswordInput = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>

/** Form-level schema: double-checks the password before submission. */
export function createResetPasswordFormSchema(t: TFunction) {
  return z
    .object({
      token: z.string().min(
        1,
        t('auth.validation.tokenRequired', {
          defaultValue: 'Reset token is required',
        }),
      ),
      email: emailValidator(t),
      password: passwordValidator(t),
      confirmPassword: confirmPasswordValidator(t),
    })
    .refine((data) => data.confirmPassword === data.password, {
      message: passwordMismatchMessage(t),
      path: ['confirmPassword'],
    })
}

export type ResetPasswordFormInput = z.infer<
  ReturnType<typeof createResetPasswordFormSchema>
>

// ── Change Password ──
export function createChangePasswordSchema(t: TFunction) {
  return z
    .object({
      currentPassword: z.string().min(
        1,
        t('auth.validation.currentRequired', {
          defaultValue: 'Current password is required',
        }),
      ),
      newPassword: passwordValidator(t),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: t('auth.validation.newDiffers', {
        defaultValue: 'New password must differ from current password',
      }),
      path: ['newPassword'],
    })
}

export type ChangePasswordInput = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>
