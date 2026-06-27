import { QueryClient } from '@tanstack/react-query'
import type { AuthState } from '../../features/auth/types'
import { API_BASE } from '../../lib/api-client'

const initialAuth: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
}

export async function getContext(request?: Request): Promise<{
  queryClient: QueryClient
  auth: AuthState
}> {
  const queryClient = new QueryClient()

  // Attempt SSR auth by forwarding the refresh cookie to Django GET /api/auth/me/
  if (request) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me/`, {
        headers: {
          Cookie: request.headers.get('Cookie') || '',
        },
      })

      if (res.ok) {
        const body = (await res.json()) as { success: boolean; data?: { user: { id: string; username: string; email: string; createdAt: string } } }
        if (body.success && body.data?.user) {
          const u = body.data.user
          return {
            queryClient,
            auth: {
              isAuthenticated: true,
              user: { id: u.id, username: u.username, email: u.email, createdAt: u.createdAt },
              isLoading: false,
            },
          }
        }
      }
    } catch {
      // Django unreachable — fall through to unauthenticated
    }
  }

  return {
    queryClient,
    auth: initialAuth,
  }
}
export default function TanstackQueryProvider() {}
