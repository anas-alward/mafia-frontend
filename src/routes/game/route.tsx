import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'

export const Route = createFileRoute('/game')({
  component: GameLayout,
})

function GameLayout() {
  return (
    <>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </>
  )
}
