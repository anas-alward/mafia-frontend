import { Button } from '#/components/ui/button'
import { Wifi, WifiOff } from 'lucide-react'

interface DisconnectedOverlayProps {
  onReconnect: () => void
}

export function DisconnectedOverlay({ onReconnect }: DisconnectedOverlayProps) {
  return (
    <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-10 py-10 text-center space-y-5 max-w-sm w-full shadow-2xl">
        <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
          <WifiOff className="h-7 w-7 text-red-400" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-neutral-100">
            You&apos;ve been disconnected
          </h3>
          <p className="text-sm text-neutral-400">
            Your connection to the meeting was lost.
          </p>
        </div>
        <Button onClick={onReconnect} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
          <Wifi className="h-4 w-4" />
          Reconnect
        </Button>
      </div>
    </div>
  )
}
