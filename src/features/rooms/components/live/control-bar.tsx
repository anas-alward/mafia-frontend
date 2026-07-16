import { useState, useCallback, useEffect, useRef } from 'react'
import {
  RtkFullscreenToggle,
  RtkMicToggle,
  RtkCameraToggle,
  RtkStageToggle,
  RtkLeaveButton,
} from '@cloudflare/realtimekit-react-ui'

export default function ControlBar({ fullScreenRef }: { fullScreenRef: React.RefObject<HTMLDivElement | null> }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const show = useCallback(() => {
    setVisible(true)
  }, [])

  const scheduleHide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 600)
  }, [])

  const cancelHide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const zoneHeight = 100
      if (e.clientY > window.innerHeight - zoneHeight) {
        show()
        cancelHide()
      } else {
        scheduleHide()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [show, cancelHide, scheduleHide])

  return (
    <div
      onMouseEnter={() => { show(); cancelHide() }}
      onMouseLeave={scheduleHide}
      className={`absolute bottom-0 left-0 right-0 z-50 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        display: 'flex',
        width: '100%',
        padding: '8px 12px',
        color: 'white',
        justifyContent: 'space-between',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
      }}
    >
      <div
        id="controlbar-left"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RtkFullscreenToggle targetElement={fullScreenRef.current} />
      </div>
      <div
        id="controlbar-center"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <RtkMicToggle />
        <RtkCameraToggle />
        <RtkStageToggle />
        <RtkLeaveButton />
      </div>
    </div>
  )
}
