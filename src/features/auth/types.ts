// Auth-specific TypeScript types for the JWT authentication system
// Feature: 002-jwt-authentication

/** Public user data — returned to client, never includes password hash */
export interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

/** Authenticated state with user info */
export type AuthState =
  | { isAuthenticated: true; user: User; isLoading: false }
  | { isAuthenticated: false; user: null; isLoading: false }
  | { isAuthenticated: false; user: null; isLoading: true }

/** JWT payload embedded in access/refresh tokens */
export interface TokenPayload {
  sub: string // user ID
  username: string
  type: 'access' | 'refresh'
  iat: number
  exp: number
}
