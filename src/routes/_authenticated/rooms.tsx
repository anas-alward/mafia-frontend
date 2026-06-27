import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/rooms')({
  component: RoomsPage,
})

function RoomsPage() {
  return (
    <div className="max-w-lg">
      <h1 className="display-title text-4xl text-neutral-900">Rooms</h1>
      <p className="mt-4 text-neutral-600">
        Game rooms will appear here. Join or create a room to start playing.
      </p>
    </div>
  )
}
