import { useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { ArrowLeft, Loader2, Video } from 'lucide-react'

interface RoomWaitingStateProps {
  roomId: string
}

export function RoomWaitingState({ roomId }: RoomWaitingStateProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
        onClick={() => navigate({ to: '/' })}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className="bg-white border border-neutral-200 rounded-2xl px-10 py-10 text-center space-y-5 max-w-sm w-full shadow-2xl">
        <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
          <Video className="h-7 w-7 text-blue-500" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-neutral-900">Joining meeting...</h2>
          <p className="text-sm text-neutral-500">Code: {roomId}</p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mx-auto" />
      </div>
    </div>
  )
}
