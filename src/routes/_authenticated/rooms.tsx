import { createFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router'
import { CreateMeetingButton } from '#/features/rooms/components/create-meeting-button'
import { JoinMeetingForm } from '#/features/rooms/components/join-meeting-form'

export const Route = createFileRoute('/_authenticated/rooms')({
  component: RoomsLayout,
})

function RoomsLayout() {
  const matchRoute = useMatchRoute()
  const isRoomDetail = matchRoute({ to: '/rooms/$roomId', fuzzy: true })

  if (isRoomDetail) {
    return <Outlet />
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
          What would you like to do?
        </h2>
        <p className="text-neutral-500">
          Start an instant meeting or join one with a link
        </p>
      </div>

      <CreateMeetingButton />

      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-sm text-neutral-400">or</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      <JoinMeetingForm />
    </div>
  )
}
