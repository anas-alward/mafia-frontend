import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { SessionInit } from '../features/auth/components/session-init'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import type { AuthState } from '../features/auth/types'

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: ({ location }) => {
    const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email']
    if (publicPaths.includes(location.pathname)) return

    const { isAuthenticated, isLoading } = useAuthStore.getState()
    if (!isAuthenticated && !isLoading) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'description',
        content:
          'Mafia is a multiplayer social deduction game. Deceive, deduce, and survive — play online with friends.',
      },
      {
        title: 'Mafia — Social Deduction Online',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <SessionInit />
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
