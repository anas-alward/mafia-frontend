import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '../types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  /** Set authenticated state after login/signup */
  setAuth: (user: User, accessToken: string, refreshToken: string) => void

  /** Clear auth state on logout */
  clearAuth: () => void

  /** Set loading state (during silent refresh) */
  setLoading: (loading: boolean) => void

  /** Get a snapshot for server-side router context */
  getSnapshot: () => AuthState
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      getSnapshot: () => {
        const state = get()
        if (state.isAuthenticated && state.user) {
          return { isAuthenticated: true, user: state.user, isLoading: false }
        }
        if (state.isLoading) {
          return { isAuthenticated: false, user: null, isLoading: true }
        }
        return { isAuthenticated: false, user: null, isLoading: false }
      },
    }),
    {
      name: 'mafia-auth',
      // Only persist these keys — isLoading should always start as true on page load
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // On rehydrate, set loading to false (hydration is done)
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false)
        }
      },
    },
  ),
)
