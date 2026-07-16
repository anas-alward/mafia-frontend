import { useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { ArrowLeft, AlertTriangle, Wifi } from 'lucide-react'

interface RoomErrorStateProps {
  onReconnect: () => void
}

export function RoomErrorState({ onReconnect }: RoomErrorStateProps) {
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
        <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-neutral-900">Connection error</h2>
          <p className="text-sm text-neutral-500">Could not connect to the meeting server.</p>
        </div>
        <Button
          onClick={onReconnect}
          variant="outline"
          className="gap-2 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <Wifi className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  )
}
