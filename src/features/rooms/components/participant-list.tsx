import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'
import { Button } from '#/components/ui/button'
import { Users, Crown, X, PhoneOff } from 'lucide-react'

export interface Participant {
  userId: number
  username: string
}

interface ParticipantListProps {
  participants: Participant[]
  hostId: number | null
  currentUserId: string
  isHost: boolean
  onKick: (userId: number) => void
  onEndMeeting: () => void
}

export function ParticipantList({
  participants,
  hostId,
  currentUserId,
  isHost,
  onKick,
  onEndMeeting,
}: ParticipantListProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-300 hover:text-white hover:bg-white/10 gap-1.5 rounded-full"
        >
          <Users className="h-4 w-4" />
          <span className="text-xs">{participants.length}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-0 flex flex-col bg-neutral-950 border-l border-neutral-800 text-neutral-200">
        <SheetHeader className="px-4 py-3 border-b border-neutral-800">
          <SheetTitle className="text-sm font-medium text-neutral-200">
            Participants ({participants.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {participants.map((p) => {
            const isParticipantHost = hostId === p.userId
            const isSelf = String(p.userId) === currentUserId
            const canKick = isHost && !isParticipantHost && !isSelf

            return (
              <div
                key={p.userId}
                className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-neutral-900 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 ring-1 ring-neutral-700">
                    <span className="text-sm font-medium text-neutral-300">
                      {p.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm truncate text-neutral-200">
                    {p.username}
                    {isSelf && <span className="text-neutral-500 ml-1">(You)</span>}
                  </span>
                  {isParticipantHost && (
                    <Crown className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  )}
                </div>
                {canKick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-full"
                    onClick={() => onKick(p.userId)}
                    aria-label={`Remove ${p.username}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {isHost && (
          <div className="px-4 py-3 border-t border-neutral-800">
            <Button
              variant="destructive"
              className="w-full gap-2 bg-red-600/90 hover:bg-red-600 text-white"
              onClick={onEndMeeting}
            >
              <PhoneOff className="h-4 w-4" />
              End meeting for all
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
