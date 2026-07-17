import { createFileRoute } from '@tanstack/react-router'
import { MeetingEndedState } from '#/features/rooms/states/meeting-ended-state'

export const Route = createFileRoute('/rooms/$roomId/ended')({
  component: MeetingEndedRoute,
})

function MeetingEndedRoute() {
  return (
    <div className="flex flex-col h-screen bg-[#161618]">
      <MeetingEndedState />
    </div>
  )
}
