import { useEffect, useRef } from 'react'
import { ScrollText } from 'lucide-react'
import { useGameContext } from '#/features/rooms/context/game-context'

export function GameLog() {
  const { logs, gameStarted } = useGameContext()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  if (!gameStarted) return null

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <ScrollText className="h-4 w-4 text-[#a1a1aa]" />
        <span className="text-sm font-medium text-[#a1a1aa]">Event Log</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {logs.length === 0 ? (
          <p className="text-sm text-[#71717a]">No events yet.</p>
        ) : (
          logs.map((entry, i) => (
            <p
              key={i}
              className="text-sm text-[#d4d4d8] leading-relaxed"
            >
              {entry.message}
            </p>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
