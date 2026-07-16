import { RtkStage } from '@cloudflare/realtimekit-react-ui'
import JoinRequestsPanel from '#/features/rooms/components/join-requests-pannel.tsx'
import TilesGrid from '#/features/rooms/components/live/tiles-grid.tsx'
import ControlBar from '#/features/rooms/components/live/control-bar.tsx'

interface RoomActiveStateProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
}

export function RoomActiveState({
  fullScreenRef,
}: RoomActiveStateProps) {
  return (
    <>
      <RtkStage
        style={{
          flex: 1,
          flexGrow: 1,
          flexShrink: 1,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <TilesGrid />
      </RtkStage>

      <JoinRequestsPanel />

      <ControlBar fullScreenRef={fullScreenRef} />
    </>
  )
}
