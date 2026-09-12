import { useEffect, useReducer } from 'react'
import { useParticipants } from '@livekit/components-react'
import { useGameStore } from '#/features/game/store/game-store'
import LiveParticipantTile from '#/features/rooms/components/live/participant-tile'
import { TileEventOverlay } from '#/features/game/components/tile-event-overlay'
import { TileActionOverlay } from '#/features/rooms/components/live/tile-action-overlay'

export function getColumns(count: number) {
  if (count <= 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
}

export default function TilesGrid() {
  const participants = useParticipants()
  const gameStarted = useGameStore((s) => s.gameStarted)
  const playerIds = useGameStore((s) => s.playerIds)
  const deadPlayerIds = useGameStore((s) => s.deadPlayerIds)
  const graveyardHoldUntil = useGameStore((s) => s.graveyardHoldUntil)

  // Re-render while a held (recently died) tile's grace window expires so
  // it moves to the graveyard after its elimination animation finishes.
  const [, tick] = useReducer((x: number) => x + 1, 0)
  const hasHolds = Object.values(graveyardHoldUntil).some((t) => t > Date.now())
  useEffect(() => {
    if (!hasHolds) return
    const iv = setInterval(() => tick(), 400)
    return () => clearInterval(iv)
  }, [hasHolds])

  // Once a game is running, eliminated players leave the main grid
  // (they live on in the graveyard rail) — except players whose death
  // animation is still playing out on their tile. Connected users who were
  // never dealt into the game leave the grid too — the graveyard rail
  // shows them in its spectator strip instead.
  const deadSet = new Set(deadPlayerIds)
  const inGameSet = new Set(playerIds)
  const gridParticipants = gameStarted
    ? participants.filter((p) => {
        const id = Number(p.identity)
        if (Number.isFinite(id) && !inGameSet.has(id)) return false
        if (!deadSet.has(id)) return true
        return (graveyardHoldUntil[id] ?? 0) > Date.now()
      })
    : participants
  // Only remote participants in the grid — self is rendered as a corner tile
  const remoteParticipants = gridParticipants.filter((p) => !p.isLocal)
  const cols = getColumns(remoteParticipants.length)
  const rows = Math.ceil(remoteParticipants.length / cols)
  const pad = '1.5rem'
  const gap = '0.75rem'
  const itemW = `calc((100% - ${pad} - (${cols} - 1) * ${gap}) / ${cols})`
  const itemH = `calc((100% - ${pad} - (${rows} - 1) * ${gap}) / ${rows})`

  return (
    <div className="flex flex-wrap content-center justify-center h-full w-full gap-3 p-4">
      {remoteParticipants.map((participant) => {
        const userId = participant.identity
          ? Number(participant.identity)
          : null
        return (
          <div
            key={participant.identity || 'participant-tile'}
            style={{ width: itemW, height: itemH }}
          >
            <TileEventOverlay userId={userId}>
              {(isAnimating) => (
                <TileActionOverlay
                  participant={participant}
                  hideActions={isAnimating}
                >
                  <LiveParticipantTile
                    participant={participant}
                    isSelected={false}
                    isSelectable={false}
                    onSelect={() => {}}
                  />
                </TileActionOverlay>
              )}
            </TileEventOverlay>
          </div>
        )
      })}
    </div>
  )
}
