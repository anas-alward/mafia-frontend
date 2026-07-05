import { useCallback, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Copy, Check, Wifi, WifiOff } from 'lucide-react'

interface MeetingBottomBarProps {
  roomCode: string
  roomId: string
  wsState: 'connecting' | 'open' | 'closed' | 'error'
}

export function MeetingBottomBar({ roomCode, roomId, wsState }: MeetingBottomBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const url = `${window.location.origin}/rooms/${roomId}`
    navigator.clipboard.writeText(url).catch(() => {
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [roomId])

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 bg-neutral-900/80 backdrop-blur-md rounded-full border border-neutral-800 text-xs text-neutral-300 shadow-lg">
      <div className="flex items-center gap-2">
        {wsState === 'open' ? (
          <Wifi className="h-3 w-3 text-emerald-400" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-400" />
        )}
        <span className="text-neutral-400">{roomCode}</span>
      </div>
      <div className="h-4 w-px bg-neutral-700" />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="text-xs h-auto px-2 py-0.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-full"
      >
        {copied ? (
          <><Check className="h-3 w-3 mr-1 text-emerald-400" />Copied</>
        ) : (
          <><Copy className="h-3 w-3 mr-1" />Copy link</>
        )}
      </Button>
    </div>
  )
}
