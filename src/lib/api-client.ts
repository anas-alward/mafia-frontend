// Project-wide API client — shared fetch wrapper for all Django backend calls.
// Every feature imports from here; domain-specific endpoint functions live in their own api/client.ts.

/** Resolved from VITE_API_BASE_URL env, defaults to localhost:8000 for dev */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// ── Generic response wrappers (matches Django API conventions) ──

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  errors?: Array<{
    code: string
    message: string
    field?: string
  }>
  message?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ── Fetch wrapper ──

/**
 * Typed fetch wrapper for the Django REST API.
 * Automatically includes `credentials: 'include'` for httpOnly cookie forwarding
 * and `Content-Type: application/json`. Throws the parsed JSON error body on non-2xx.
 */
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const body = await res.json()

  if (!res.ok) {
    throw body
  }

  return body
}
