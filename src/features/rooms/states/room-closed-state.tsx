import { useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Video } from 'lucide-react'

export function RoomClosedState() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="bg-white border border-neutral-200 rounded-2xl px-10 py-10 text-center space-y-5 max-w-sm w-full shadow-2xl">
        <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
          <Video className="h-7 w-7 text-amber-500" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-neutral-900">Meeting ended by host</h2>
          <p className="text-sm text-neutral-500">Redirecting to rooms page...</p>
        </div>
        <Button
          variant="outline"
          className="border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          onClick={() => navigate({ to: '/' })}
        >
          Back to rooms
        </Button>
      </div>
    </div>
  )
}
