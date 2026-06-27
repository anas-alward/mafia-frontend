# Research: JWT Authentication System

**Feature**: 002-jwt-authentication | **Date**: 2026-06-26

**Bugfix**: 2026-06-26 — BUG-001 Invalidated Decisions 2 (jose), 3 (PBKDF2), 4 (D1). Added Decisions 8 (Django API client), 9 (API base URL config), 10 (CORS/cookie forwarding). Updated Decision 1 (Zustand) to reflect Django API integration.
**Bugfix**: 2026-06-26 — BUG-002 Updated Decision 8 to place shared `request<T>()` fetch wrapper in `src/lib/api-client.ts` instead of inside the auth feature, so all features can call Django without depending on auth.

## Decision 1: Zustand + TanStack Start Integration

**Decision**: Use Zustand for client-side auth state, hydrating from TanStack Router's server-provided context on initial load, then managing state client-side for subsequent navigations.

**Rationale**: TanStack Start's router context runs on every SSR request and can extract the JWT from cookies. However, the context is read-only during client-side navigation. Zustand provides a mutable store that survives client-side navigations and can be accessed from any component or route `beforeLoad`. The store is hydrated once from the server context and then takes over.

**Alternatives considered**:
- React Context: Works but causes re-renders across the entire tree on every auth state change. Zustand offers granular subscriptions.
- TanStack Query cache for auth: Overcomplicates a simple state problem. Auth state is not server-cached data — it's session state.
- URL state: Not appropriate for sensitive auth tokens.

**Integration pattern**:
```ts
// router.tsx — server-side context extraction
function getContext(request?: ServerRequest) {
  const queryClient = new QueryClient()
  const auth = request ? extractAuthFromRequest(request) : initialAuthState
  return { queryClient, auth }
}

// auth-store.ts — client-side store
const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isLoading: false }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),
}))
```

## ~~Decision 2: JWT Library — jose~~ (INVALIDATED by BUG-001)

~~**Decision**: Use `jose` for JWT creation and verification.~~

**Reason invalidated**: Django backend handles all JWT operations (signing, verification, refresh). The frontend Workers never create or verify JWTs — they only receive and forward tokens to Django.

## ~~Decision 3: Password Hashing — Web Crypto PBKDF2~~ (INVALIDATED by BUG-001)

~~**Decision**: Use the Web Crypto API's PBKDF2 for password hashing.~~

**Reason invalidated**: Django backend hashes passwords using its own configured algorithm (e.g., bcrypt/argon2 via Django's `make_password`). The frontend never sees or processes raw passwords beyond form submission.

## ~~Decision 4: Cloudflare D1 for User Storage~~ (INVALIDATED by BUG-001)

~~**Decision**: Use Cloudflare D1 (SQLite) with three tables: `users`, `password_reset_tokens`, `refresh_tokens`.~~

**Reason invalidated**: Django backend manages its own database (PostgreSQL). Users, tokens, and sessions are Django models. The frontend Workers have no database — all data access is via Django REST API calls.

## Decision 5: shadcn Form + Zod Validation

**Decision**: Use shadcn/ui's `Form` component (react-hook-form wrapper) with `zod` resolvers for all auth forms.

**Rationale**: The user explicitly requested shadcn forms and zod. shadcn's Form wraps `react-hook-form` with `@hookform/resolvers/zod`, providing type-safe validation that infers TypeScript types from Zod schemas. This eliminates manual type definitions for form values.

**Form pattern**:
```tsx
// schema
const loginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8),
})

// component
const form = useForm<z.infer<typeof loginSchema>>({
  resolver: zodResolver(loginSchema),
  defaultValues: { username: '', password: '' },
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="username" render={({ field }) => (
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </form>
</Form>
```

## Decision 6: TanStack Router Auth Guard

**Decision**: Use TanStack Router's `beforeLoad` hook on route groups for auth protection, and `loader` hooks for server-side data.

**Rationale**: `beforeLoad` runs before a route renders and can throw `redirect()`. This is the idiomatic TanStack Router pattern for auth guards. For the `_authenticated` route group, a single `beforeLoad` in the layout route protects all child routes. The redirect preserves the original URL for post-login redirect.

**Pattern**:
```ts
// _authenticated/route.tsx
export const Route = createRoute({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
})
```

## Decision 7: Email Sending — Handled by Django Backend (UPDATED by BUG-001)

**Decision**: Email sending for password reset is handled by the Django backend. The frontend only calls `POST /api/auth/forgot-password/` and displays the confirmation message. The actual email transport (SMTP, SendGrid, etc.) is configured in Django, not in the Workers frontend.

**Rationale**: The Django backend already has email configuration and sending capability. The frontend doesn't need to mock or defer email — Django sends the actual email.

~~**Rationale**: Email sending requires an external service (Resend, SendGrid, etc.) with API keys, domain verification, and template setup. This is infrastructure work outside the scope of the authentication feature. The password reset flow is fully implemented — only the email transport is mocked.~~

## Decision 8: Django API Client — Native fetch + Shared Foundation in `src/lib/`

**Decision**: Use the native `fetch` API (available in both Workers SSR and browser) to call Django backend endpoints. The project-wide `request<T>()` helper, `API_BASE` resolution, and shared types (`ApiSuccess<T>`, `ApiError`) live in `src/lib/api-client.ts`. Each feature (auth, game, etc.) creates its own `api/client.ts` that imports from this shared foundation and defines only its domain-specific endpoint functions.

**Rationale**: `fetch` is universally available in Workers and browsers without additional dependencies. Separating the shared fetch wrapper (in `src/lib/`) from domain-specific endpoints (in `src/features/<feature>/api/`) means game features, leaderboards, user profiles, etc. can call Django without depending on the auth feature. Single `API_BASE` resolution and consistent error handling across all features.

**Usage**:
```ts
// src/lib/api-client.ts — project-wide foundation
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const body = await res.json()
  if (!res.ok) throw body
  return body
}
```

```ts
// src/features/auth/api/client.ts — auth-specific endpoints
import { request } from '#/lib/api-client'

export async function signUp(body: SignUpRequest) {
  return request<{ data: AuthTokens }>('/api/auth/signup/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
```

## Decision 9: API Base URL — Environment Variable

**Decision**: Configure the Django API base URL via `VITE_API_BASE_URL` environment variable, defaulting to `http://localhost:8000` for development.

**Rationale**: Different environments (local dev, staging, production) point to different Django instances. Vite's `import.meta.env` handles this with `.env` files. No hardcoded URLs.

**Setup**: `.env` file at project root: `VITE_API_BASE_URL=http://localhost:8000`

## Decision 10: Cookie Forwarding — Credentials Include

**Decision**: Use `credentials: 'include'` on all fetch calls to the Django backend, ensuring the refresh token cookie is sent and received automatically by the browser.

**Rationale**: The Django backend sets the `refresh_token` as an HTTP-only cookie. Using `credentials: 'include'` tells the browser to include cookies in cross-origin requests. Django must be configured with CORS (`django-cors-headers`) to accept credentialed requests from the Workers frontend origin.
