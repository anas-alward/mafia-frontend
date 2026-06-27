import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/auth-store'

/**
 * On app mount, restores session from persisted auth state.
 * If a refresh token exists, attempts to rotate the access token.
 * If no persisted auth exists, marks loading as complete.
 */
export function SessionInit() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setLoading = useAuthStore((s) => s.setLoading)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      // No persisted session — nothing to restore
      if (!isAuthenticated || !refreshToken) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/accounts/token/refresh/`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          },
        )

        if (!res.ok) {
          clearAuth()
          return
        }

        const body = await res.json()
        const payload = body.data ?? body
        const { access, refresh: newRefresh } = payload

        if (access) {
          const user = useAuthStore.getState().user
          if (user) {
            setAuth(user, access, newRefresh ?? refreshToken)
          }
        }
      } catch {
        // Network error — keep existing auth, might still be valid
        setLoading(false)
      }
    }

    init()
  }, [setAuth, setLoading, clearAuth, refreshToken, isAuthenticated])

  return null
}
