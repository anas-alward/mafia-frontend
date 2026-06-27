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

// ── Token refresh lock (prevents concurrent refresh calls) ──

let refreshPromise: Promise<string | null> | null = null

async function getAccessToken(): Promise<string | null> {
  try {
    const { useAuthStore } = await import('#/features/auth/store/auth-store')
    return useAuthStore.getState().accessToken
  } catch {
    return null
  }
}

async function tryRefreshToken(): Promise<string | null> {
  // If a refresh is already in flight, wait for it
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const { useAuthStore } = await import('#/features/auth/store/auth-store')
      const currentRefreshToken = useAuthStore.getState().refreshToken

      if (!currentRefreshToken) {
        useAuthStore.getState().clearAuth()
        return null
      }

      const res = await fetch(`${API_BASE}/accounts/token/refresh/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: currentRefreshToken }),
      })

      if (!res.ok) {
        useAuthStore.getState().clearAuth()
        return null
      }

      const body = await res.json()
      // Django simplejwt returns { access: "...", refresh: "..." }
      // or it may be wrapped in { data: { access, refresh } }
      const payload = body.data ?? body
      const { access, refresh: newRefresh } = payload

      if (access) {
        const user = useAuthStore.getState().user
        if (user) {
          useAuthStore.getState().setAuth(
            user,
            access,
            newRefresh ?? currentRefreshToken,
          )
        }
        return access
      }

      return null
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// ── Fetch wrapper ──

/**
 * Typed fetch wrapper for the Django REST API.
 *
 * Auth strategy:
 * - JWT access token sent as `Authorization: Bearer <token>`.
 * - On 401, silently attempts token refresh via httpOnly refresh cookie, then retries once.
 * - `credentials: 'include'` sends httpOnly cookies automatically.
 */
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const doFetch = (overrideHeaders?: Record<string, string>) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...headers,
        ...(overrideHeaders ?? {}),
        ...(options.headers as Record<string, string> | undefined),
      },
    })

  let res = await doFetch()

  // 401 → try refresh and retry once (skip if this IS the refresh endpoint)
  if (res.status === 401 && !path.includes('/token/refresh/')) {
    const newToken = await tryRefreshToken()
    if (newToken) {
      res = await doFetch({ Authorization: `Bearer ${newToken}` })
    }
  }

  const body = await res.json()

  if (!res.ok) {
    throw body
  }

  return body
}
