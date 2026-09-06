import { useCallback, useEffect, useState } from 'react'
import { Maximize, Minimize } from 'lucide-react'

interface FullscreenButtonProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
}

export function FullscreenButton({ fullScreenRef }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      fullScreenRef.current?.requestFullscreen()
    }
  }, [fullScreenRef])

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:bg-[var(--game-bg-elevated)]"
      style={{ color: 'var(--game-text-muted)' }}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? (
        <Minimize className="h-4 w-4" />
      ) : (
        <Maximize className="h-4 w-4" />
      )}
    </button>
  )
}
