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
import { LocaleSync } from '../i18n/LocaleSync'

import appCss from '../styles.css?url'
import {
  SHARE_IMAGE,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from '#/lib/site'

import type { QueryClient } from '@tanstack/react-query'
import type { AuthState } from '../features/auth/types'

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: ({ location }) => {
    const publicPaths = [
      '/login',
      '/signup',
      '/password/forgot',
      '/password/reset',
      '/verify-email',
    ]
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
        content: SITE_DESCRIPTION,
      },
      {
        title: SITE_TITLE,
      },
      // Open Graph — Facebook, LinkedIn, WhatsApp, Discord, Telegram…
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'Mafia',
      },
      {
        property: 'og:title',
        content: SITE_TITLE,
      },
      {
        property: 'og:description',
        content: SITE_DESCRIPTION,
      },
      {
        property: 'og:image',
        content: SHARE_IMAGE,
      },
      {
        property: 'og:image:secure_url',
        content: SHARE_IMAGE,
      },
      {
        property: 'og:image:type',
        content: 'image/png',
      },
      {
        property: 'og:image:width',
        content: String(SHARE_IMAGE_WIDTH),
      },
      {
        property: 'og:image:height',
        content: String(SHARE_IMAGE_HEIGHT),
      },
      {
        property: 'og:image:alt',
        content: SITE_TITLE,
      },
      {
        property: 'og:locale',
        content: 'en_US',
      },
      // X / Twitter — preview.png is 1200×630, so it fills the large card
      // without cropping.
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: SITE_TITLE,
      },
      {
        name: 'twitter:description',
        content: SITE_DESCRIPTION,
      },
      {
        name: 'twitter:image',
        content: SHARE_IMAGE,
      },
      {
        name: 'twitter:image:alt',
        content: SITE_TITLE,
      },
      {
        name: 'theme-color',
        content: '#18181b',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'Mafia',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
        sizes: '16x16 32x32 48x48',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/logo192.png',
        sizes: '192x192',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/logo512.png',
        sizes: '512x512',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
        sizes: '180x180',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
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
        <LocaleSync />
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
