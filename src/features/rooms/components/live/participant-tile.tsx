import {
  useIsSpeaking,
  useParticipantTracks,
  VideoTrack,
} from '@livekit/components-react'
import type { Participant } from 'livekit-client'
import { Track } from 'livekit-client'
import { useGameStore } from '#/features/game/store/game-store'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { ROLE_REGISTRY, Team } from '#/features/game/constants/roles'
import type { RoleDefinition } from '#/features/game/constants/roles'
import { TileRoleBadge } from '#/features/game/components/tile-role-badge'
import { VoteCountBadge } from '#/features/game/components/vote-count-badge'
import { resolveTileBorder } from '#/features/game/tile-events'
import { getTileColor } from '#/features/rooms/utils/tile-colors'
import { ParticipantNameTag } from '#/features/rooms/components/live/participant-name-tag'

// ── Props ──

interface LiveParticipantTileProps {
  participant: Participant
  isSelected: boolean
  isSelectable: boolean
  onSelect: (userId: number) => void
}

export default function LiveParticipantTile({
  participant,
  isSelected,
  isSelectable,
  onSelect,
}: LiveParticipantTileProps) {
  const cameraRefs = useParticipantTracks([Track.Source.Camera], {
    participantIdentity: participant.identity,
  })
  const cameraRef = cameraRefs.length > 0 ? cameraRefs[0] : undefined
  const isSpeaking = useIsSpeaking(participant)
  const name = participant.name

  const videoEnabled =
    cameraRef != null &&
    cameraRef.publication.isSubscribed &&
    !cameraRef.publication.isMuted

  const initial = name ? name.charAt(0).toUpperCase() : '?'

  const gameStarted = useGameStore((s) => s.gameStarted)
  const myRoleCode = useGameStore((s) => s.myRoleCode)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const currentVotes = useGameStore((s) => s.currentVotes)
  const actionBorders = useGameStore((s) => s.actionBorders)
  const voterSelection = useGameStore((s) => s.voterSelection)

  const roleDefinition: RoleDefinition | undefined = myRoleCode
    ? ROLE_REGISTRY[myRoleCode]
    : undefined
  const myRoleType = roleDefinition?.role_type
  const isMafia = myRoleType === Team.MAFIA
  const tileUserId: number | null = participant.identity
    ? Number(participant.identity)
    : null
  const isAlive = tileUserId != null && alivePlayerIds.includes(tileUserId)

  const currentUser = useAuthStore((s) => s.user)
  const myUserId = currentUser ? Number(currentUser.id) : null
  const isLocal =
    tileUserId != null &&
    currentUser != null &&
    tileUserId === Number(currentUser.id)

  // My latest vote's target — the gold border marks this tile and moves
  // when I revote. While a voter selection is active the gold border hides
  // so the selection outline stands alone; it returns when the selection
  // clears.
  const selectionActive = voterSelection.targetId != null
  const myVoteTarget =
    myUserId != null && !selectionActive
      ? currentVotes.get(myUserId)
      : undefined

  const tileColor = getTileColor(tileUserId)

  // ---- Ring / border ----
  let ringClass = ''
  const ringStyle: React.CSSProperties = {}

  const borderColor = resolveTileBorder(tileUserId, myVoteTarget, actionBorders)
  const isDead = gameStarted && !isAlive

  // Action/vote borders draw as an inline box-shadow. Tailwind ring colors
  // live in --tw-ring-color (default currentcolor), which inline border-color
  // cannot set — and an inline shadow outranks every ring utility.
  if (borderColor != null && !isDead) {
    ringStyle.boxShadow = `0 0 0 3px ${borderColor}`
  }

  if (isDead) {
    ringStyle.borderColor = 'rgba(243, 240, 232, 0.04)'
    ringClass = 'ring-1'
  } else if (borderColor == null) {
    if (isSelected) {
      ringStyle.borderColor = 'rgba(237, 184, 58, 0.6)'
      ringClass = 'ring-2'
    } else if (isSelectable) {
      ringStyle.borderColor = 'rgba(243, 240, 232, 0.2)'
      ringClass = 'ring-1 hover:ring-white/40 cursor-pointer'
    } else if (gameStarted && isMafia && tileUserId != null && !isLocal) {
      ringStyle.borderColor = 'rgba(240, 96, 107, 0.18)'
      ringClass = 'ring-1'
    } else {
      ringStyle.borderColor = 'rgba(243, 240, 232, 0.08)'
      ringClass = 'ring-1'
    }
  }

  // Speaking glow — decorates but never replaces the action/vote border.
  if (isSpeaking && isAlive !== false) {
    const glow = '0 0 20px rgba(143, 160, 245, 0.45)'
    ringStyle.boxShadow = ringStyle.boxShadow
      ? `${ringStyle.boxShadow}, ${glow}`
      : glow
    if (borderColor == null) {
      ringStyle.borderColor = 'rgba(143, 160, 245, 0.55)'
      ringClass = 'ring-2'
    }
  }

  // Player selected via their target's vote badge.
  const isSelectedVoter =
    tileUserId != null && voterSelection.voterIds.includes(tileUserId)
  if (isSelectedVoter) {
    ringStyle.outline = '2px solid var(--game-text-primary)'
    ringStyle.outlineOffset = '2px'
  }

  const handleClick = () => {
    if (isSelectable && tileUserId != null) {
      onSelect(tileUserId)
    }
  }

  return (
    <div
      className={`relative w-full h-full rounded-lg overflow-hidden transition-all duration-200 ${ringClass}`}
      onClick={handleClick}
      style={ringStyle}
    >
      {videoEnabled ? (
        <VideoTrack
          trackRef={cameraRef}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: tileColor }}
        >
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(243, 240, 232, 0.04)' }}
          >
            <span
              className="text-4xl font-semibold select-none"
              style={{ color: 'var(--game-text-primary)', opacity: 0.55 }}
            >
              {initial}
            </span>
          </div>
        </div>
      )}

      {/* Name tag */}
      <ParticipantNameTag name={name} isSpeaking={isSpeaking} />

      {/* Vote count badge (bottom-right) */}
      <VoteCountBadge userId={tileUserId} />

      {/* Role icon (top-left) */}
      <TileRoleBadge userId={tileUserId} isLocal={isLocal} isMafia={isMafia} />
    </div>
  )
}
