import { AnimatePresence, motion } from 'motion/react'
import { Skull, User } from 'lucide-react'
import { Track } from 'livekit-client'
import {
  useParticipantTracks,
  useParticipants,
  VideoTrack,
} from '@livekit/components-react'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { ROLE_ICON_MAP, ROLE_REGISTRY } from '#/features/game/constants'
import type { Participant as LkParticipant } from 'livekit-client'

/**
 * Horizontal strip of eliminated players, rendered inside the control
 * bar's left section. Compact grayscale video chips, horizontally
 * scrollable when there are more than fit. Chips show the player's
 * role icon; your own chip keeps the skull as the death marker.
 */
export function GraveyardStrip() {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const deadPlayerIds = useGameStore((s) => s.deadPlayerIds)
  const players = useGameStore((s) => s.players)
  const logs = useGameStore((s) => s.logs)
  const participants = useMeetingStore((s) => s.participants)
  const lkParticipants = useParticipants()
  const currentUser = useAuthStore((s) => s.user)

  if (!gameStarted || deadPlayerIds.length === 0) return null

  const selfId = currentUser ? Number(currentUser.id) : null
  const byIdentity = new Map(
    lkParticipants.map((p) => [Number(p.identity), p]),
  )
  const nameById = new Map(participants.map((p) => [p.userId, p.username]))
  const roleByPlayer = new Map<number, string>()
  const roleCodeByPlayer = new Map<number, string>()
  // Primary source: game state — dead players carry their role there, so
  // reconnecting clients keep the reveal.
  for (const p of players) {
    if (p.status === 'dead' && p.role_code && p.role_name) {
      roleByPlayer.set(p.id, p.role_name)
      roleCodeByPlayer.set(p.id, p.role_code)
    }
  }
  // Fallback: derive from death logs (deaths since the last game_state
  // snapshot). Lynch entries name the victim as actor_id; every other
  // death entry names them as target_id.
  for (const log of logs) {
    if (!log.role_name) continue
    const victimId = log.action_type === 'lynch' ? log.actor_id : log.target_id
    if (!roleByPlayer.has(victimId)) {
      roleByPlayer.set(victimId, log.role_name)
      if (log.role_code) roleCodeByPlayer.set(victimId, log.role_code)
    }
  }

  const dead = deadPlayerIds.map((id) => {
    const participant = byIdentity.get(id)
    return {
      id,
      participant,
      isSelf: id === selfId,
      name: participant?.name ?? nameById.get(id) ?? `Player ${id}`,
      role: roleByPlayer.get(id),
      roleCode: roleCodeByPlayer.get(id),
    }
  })

  return (
    <div
      className="flex items-center gap-2 max-w-[22rem] px-0.5 py-1 overflow-x-auto [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      <AnimatePresence initial={false}>
        {dead.map(({ id, participant, isSelf, name, role, roleCode }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
            className="shrink-0 flex flex-col items-center"
          >
            <GraveyardChip
              isSelf={isSelf}
              roleCode={roleCode}
              participant={participant}
            />
            <span className="text-[8px] text-[#a1a1aa] truncate w-16 text-center grayscale leading-tight">
              {role ?? name}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function GraveyardChip({
  isSelf,
  roleCode,
  participant,
}: {
  isSelf: boolean
  roleCode: string | undefined
  participant: LkParticipant | undefined
}) {
  const cameraRefs = useParticipantTracks([Track.Source.Camera], {
    participantIdentity: participant?.identity ?? '',
  })
  const cameraRef = cameraRefs.length > 0 ? cameraRefs[0] : undefined

  const roleDef = roleCode ? ROLE_REGISTRY[roleCode] : undefined
  const RoleIcon = roleDef ? ROLE_ICON_MAP[roleDef.icon] : undefined

  return (
    <div
      className="relative w-16 h-10 rounded-md overflow-hidden border border-white/[0.06] grayscale opacity-55"
      style={{ backgroundColor: 'var(--game-bg-elevated)' }}
    >
      {cameraRef ? (
        <VideoTrack
          trackRef={cameraRef}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <User className="h-3.5 w-3.5 text-[#71717a]" />
        </div>
      )}
      {/* Death marker: skull for your own chip, role icon for everyone else */}
      {isSelf || !RoleIcon ? (
        <div
          className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--game-crimson)' }}
        >
          <Skull className="h-2 w-2 text-black/80" />
        </div>
      ) : (
        <div
          className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center border border-white/[0.1]"
          style={{ backgroundColor: 'rgba(27, 25, 34, 0.9)' }}
        >
          <RoleIcon className="h-2 w-2 text-[#d4d4d8]" />
        </div>
      )}
    </div>
  )
}
