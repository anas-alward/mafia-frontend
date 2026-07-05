import { Button } from '#/components/ui/button'
import { Check, X, UserPlus } from 'lucide-react'
import type { JoinRequest } from '../hooks/use-room-state'

interface JoinRequestsPanelProps {
  requests: JoinRequest[]
  onAccept: (userId: number) => void
  onReject: (userId: number) => void
  onDismiss: (userId: number) => void
}

export function JoinRequestsBanner({
  requests,
  onAccept,
  onReject,
  onDismiss,
}: JoinRequestsPanelProps) {
  if (requests.length === 0) return null

  return (
    <div className="w-72 flex-shrink-0 border-l border-neutral-800 bg-neutral-950 flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-neutral-400" />
        <h3 className="text-sm font-medium text-neutral-200">
          Join requests ({requests.length})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {requests.map((req) => (
          <div
            key={req.userId}
            className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/50 hover:bg-neutral-900/50"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-neutral-300">
                  {req.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-neutral-300 truncate">
                {req.username}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/50"
                onClick={() => onAccept(req.userId)}
                aria-label={`Accept ${req.username}`}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-950/50"
                onClick={() => {
                  onReject(req.userId)
                  onDismiss(req.userId)
                }}
                aria-label={`Reject ${req.username}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
