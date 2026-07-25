import { useEffect, useRef } from 'react'
import { ScrollText } from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'
import type { GameLogEntry } from '#/features/game/events'

const ACTION_LABELS: Record<string, string> = {
  vote: 'voted against',
  kill: 'targeted',
  heal: 'healed',
  detect: 'investigated',
  shoot: 'shot',
  revenge: 'took revenge on',
  roleblock: 'blocked',
  silent: 'passed',
  lynched: 'was lynched',
  died: 'died',
  skipped: 'skipped',
}

function formatEntry(entry: GameLogEntry, index: number): string {
  const verb = ACTION_LABELS[entry.action_type] ?? entry.action_type
  if (entry.target_id) {
    return `Player ${entry.actor_id} ${verb} Player ${entry.target_id}`
  }
  return `Player ${entry.actor_id} ${verb}`
}

export function GameLog() {
  const logs = useGameStore((s) => s.logs)
  const gameStarted = useGameStore((s) => s.gameStarted)
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
            <p key={i} className="text-sm text-[#d4d4d8] leading-relaxed">
              {formatEntry(entry, i)}
            </p>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
