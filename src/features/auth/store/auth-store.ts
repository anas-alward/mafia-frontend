import { create } from 'zustand'
import type { User, AuthState } from '../types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  /** Set authenticated state after login/signup */
  setAuth: (user: User, accessToken: string) => void

  /** Clear auth state on logout */
  clearAuth: () => void

  /** Set loading state (during silent refresh) */
  setLoading: (loading: boolean) => void

  /** Get a snapshot for server-side router context */
  getSnapshot: () => AuthState
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

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
}))
