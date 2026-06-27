// Auth-specific API endpoint functions — imports the shared fetch wrapper from src/lib-client.ts
import { request } from '#/lib/api-client'

// Re-export shared types for convenience (auth consumers only need to import from here)
export type { ApiSuccess, ApiError, ApiResponse } from '#/lib/api-client'

// ── Auth-specific types ──

export interface UserDto {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface AuthTokens {
  access: string
  refresh:string
  user: UserDto
}

export interface SignUpRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// ── Endpoints ──

export async function signUp(body: SignUpRequest) {
  return request<{ data: AuthTokens }>('/accounts/register/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function login(body: LoginRequest) {
  return request<AuthTokens>('/accounts/login/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function logout() {
  return request<{ success: true; data: null }>('/accounts/logout/', {
    method: 'POST',
  })
}

export async function refresh() {
  return request<{ success: true; data: AuthTokens }>('/accounts/token/refresh/', {
    method: 'POST',
  })
}

export async function getMe(accessToken?: string) {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  return request<{ success: true; data: { user: UserDto } }>('/accounts/me/', {
    headers,
  })
}

export async function forgotPassword(body: ForgotPasswordRequest) {
  return request<{ success: true; data: { message: string; resetLink?: string } }>(
    '/accounts/forgot-password/',
    { method: 'POST', body: JSON.stringify(body) },
  )
}

export async function resetPassword(body: ResetPasswordRequest) {
  return request<{ success: true; data: { message: string } }>(
    '/accounts/reset-password/',
    { method: 'POST', body: JSON.stringify(body) },
  )
}

export async function changePassword(body: ChangePasswordRequest) {
  return request<{ success: true; data: { message: string } }>(
    '/accounts/change-password/',
    { method: 'POST', body: JSON.stringify(body) },
  )
}

export async function verifyEmail(body: VerifyEmailRequest) {
  return request<{ success: true; data: { message: string } }>('/accounts/verify-email/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
