import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/auth-store'
import { refresh } from '../api/client'

/**
 * On app mount, attempts a silent refresh via Django's httpOnly refresh cookie.
 * Calls POST /api/auth/refresh/ with credentials: 'include' to send the cookie.
 * Hydrates the Zustand store with the result.
 */
export function SessionInit() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setLoading = useAuthStore((s) => s.setLoading)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      try {
        const result = await refresh()
        if (result.success && result.data) {
          setAuth(result.data.user, result.data.access)
        } else {
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    }

    init()
  }, [setAuth, setLoading])

  return null
}
