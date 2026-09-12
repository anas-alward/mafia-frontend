import { Mic, MicOff, Skull, User, Video, VideoOff } from 'lucide-react'
import { Track } from 'livekit-client'
import { useParticipants, useRoomContext } from '@livekit/components-react'
import { useTranslation } from 'react-i18next'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useGameStore } from '#/features/game/store/game-store'
import { sendHostMediaDisable } from '#/features/rooms/utils/host-media'

/**
 * Members section of the sidebar: everyone connected to the room, with
 * mic/camera status. The host additionally gets one-tap controls to turn
 * another member's microphone or camera off.
 */
export function MembersList() {
  const { t } = useTranslation()
  const participants = useParticipants()
  const room = useRoomContext()
  const isHost = useMeetingStore((s) => s.isHost)
  const gameStarted = useGameStore((s) => s.gameStarted)
  const deadPlayerIds = useGameStore((s) => s.deadPlayerIds)

  if (participants.length === 0) {
    return (
      <p className="px-5 py-12 text-[13px] text-[#71717a] text-center">
        {t('room.sidebar.noMembers')}
      </p>
    )
  }

  return (
    <ul className="flex flex-col">
      {participants.map((p) => {
        const micPub = p.getTrackPublication(Track.Source.Microphone)
        const camPub = p.getTrackPublication(Track.Source.Camera)
        const micMuted = micPub ? micPub.isMuted : true
        const camMuted = camPub ? camPub.isMuted : true
        const isSelf = p.isLocal
        const userId = p.identity ? Number(p.identity) : null
        const isDead =
          gameStarted && userId != null && deadPlayerIds.includes(userId)
        const canControl = isHost && !isSelf

        return (
          <li key={p.identity} className="flex items-center gap-3 px-5 py-2.5">
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full bg-white/[0.06] flex items-center justify-center">
                {p.name ? (
                  <span className="text-[13px] font-medium text-[#d4d4d8]">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-4 w-4 text-[#71717a]" />
                )}
              </div>
              {isDead && (
                <span
                  className="absolute -bottom-0.5 -end-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center border border-[#1c1c1f]"
                  style={{ backgroundColor: 'var(--game-crimson)' }}
                >
                  <Skull className="h-2 w-2 text-black/80" />
                </span>
              )}
            </div>

            <span
              className="text-[13px] truncate min-w-0 flex-1"
              style={{ color: 'var(--game-text-primary)' }}
            >
              {p.name ??
                t('room.tiles.playerFallback', {
                  id: p.identity,
                  defaultValue: `Player ${p.identity}`,
                })}
            </span>

            {isSelf && (
              <span
                className="text-[9px] font-semibold uppercase px-1 py-px rounded-full shrink-0"
                style={{
                  color: 'var(--game-gold)',
                  backgroundColor: 'rgba(237, 184, 58, 0.1)',
                }}
              >
                {t('room.sidebar.you')}
              </span>
            )}

            <div className="flex items-center gap-1 shrink-0">
              {/* Mic: status for everyone, host-only control for others */}
              {canControl ? (
                <button
                  type="button"
                  onClick={() =>
                    sendHostMediaDisable(room, p.identity, 'microphone')
                  }
                  disabled={micMuted}
                  title={
                    micMuted
                      ? t('room.sidebar.micAlreadyOff')
                      : t('room.sidebar.turnOffMic', {
                          name: p.name ?? p.identity,
                          defaultValue: `Turn off ${p.name ?? p.identity}'s microphone`,
                        })
                  }
                  className={`p-1.5 rounded-lg transition-colors ${
                    micMuted
                      ? 'cursor-default text-[#52525b]'
                      : 'cursor-pointer text-[#a1a1aa] hover:text-[#ef4444] hover:bg-[#ef4444]/10'
                  }`}
                  aria-label={t('room.sidebar.turnOffMic', {
                    name: p.name ?? p.identity,
                    defaultValue: `Turn off ${p.name ?? p.identity}'s microphone`,
                  })}
                >
                  {micMuted ? (
                    <MicOff className="h-3.5 w-3.5" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : (
                <span
                  className="p-1.5 text-[#52525b]"
                  aria-label={
                    micMuted
                      ? t('room.sidebar.micOff')
                      : t('room.sidebar.micOn')
                  }
                >
                  {micMuted ? (
                    <MicOff className="h-3.5 w-3.5" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                </span>
              )}

              {/* Camera: same pattern */}
              {canControl ? (
                <button
                  type="button"
                  onClick={() =>
                    sendHostMediaDisable(room, p.identity, 'camera')
                  }
                  disabled={camMuted}
                  title={
                    camMuted
                      ? t('room.sidebar.camAlreadyOff')
                      : t('room.sidebar.turnOffCam', {
                          name: p.name ?? p.identity,
                          defaultValue: `Turn off ${p.name ?? p.identity}'s camera`,
                        })
                  }
                  className={`p-1.5 rounded-lg transition-colors ${
                    camMuted
                      ? 'cursor-default text-[#52525b]'
                      : 'cursor-pointer text-[#a1a1aa] hover:text-[#ef4444] hover:bg-[#ef4444]/10'
                  }`}
                  aria-label={t('room.sidebar.turnOffCam', {
                    name: p.name ?? p.identity,
                    defaultValue: `Turn off ${p.name ?? p.identity}'s camera`,
                  })}
                >
                  {camMuted ? (
                    <VideoOff className="h-3.5 w-3.5" />
                  ) : (
                    <Video className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : (
                <span
                  className="p-1.5 text-[#52525b]"
                  aria-label={
                    camMuted
                      ? t('room.sidebar.camOff')
                      : t('room.sidebar.camOn')
                  }
                >
                  {camMuted ? (
                    <VideoOff className="h-3.5 w-3.5" />
                  ) : (
                    <Video className="h-3.5 w-3.5" />
                  )}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
