// src/features/rooms/components/live/start-game-tooltip.tsx
import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import { Play, Check } from 'lucide-react'

interface LiveKitParticipant {
  identity?: string
  name?: string
}

interface StartGameTooltipProps {
  anchorRef: React.RefObject<HTMLElement | null>
  participants: LiveKitParticipant[]
  onStartGame: (playerIds: number[]) => void
  isOpen: boolean
  onClose: () => void
}

export default function StartGameTooltip({
  anchorRef,
  participants,
  onStartGame,
  isOpen,
  onClose,
}: StartGameTooltipProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [placement, setPlacement] = useState<'above' | 'below'>('above')
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Reset selection when tooltip opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set())
    }
  }, [isOpen])

  // Position tooltip with viewport boundary detection.
  // useLayoutEffect runs after render but before paint — no visible flicker.
  useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current || !tooltipRef.current) return

    const recalc = () => {
      const anchorRect = anchorRef.current!.getBoundingClientRect()
      const tooltipRect = tooltipRef.current!.getBoundingClientRect()
      const tooltipH = tooltipRect.height
      const tooltipW = tooltipRect.width
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight
      const gap = 8
      const pad = 8

      const fitsAbove = anchorRect.top - gap >= tooltipH
      const fitsBelow = viewportH - anchorRect.bottom - gap >= tooltipH
      const placeBelow = !fitsAbove && fitsBelow

      const top = placeBelow
        ? anchorRect.bottom + gap
        : anchorRect.top - tooltipH - gap

      let left = anchorRect.left + anchorRect.width / 2 - tooltipW / 2
      if (left < pad) left = pad
      if (left + tooltipW > viewportW - pad) {
        left = viewportW - tooltipW - pad
      }

      setPosition({ top, left })
      setPlacement(placeBelow ? 'below' : 'above')
    }

    recalc()
    window.addEventListener('resize', recalc)
    window.addEventListener('scroll', recalc, { passive: true, capture: true })
    return () => {
      window.removeEventListener('resize', recalc)
      window.removeEventListener('scroll', recalc, { capture: true })
    }
  }, [isOpen, anchorRef])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Close on outside click (skip the button that opens it)
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const isInsideTooltip = tooltipRef.current?.contains(target)
      const isOnAnchor = anchorRef.current?.contains(target)
      if (!isInsideTooltip && !isOnAnchor) {
        onClose()
      }
    }
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handler)
    }, 0)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousedown', handler)
    }
  }, [isOpen, onClose, anchorRef])

  const toggleParticipant = useCallback((userId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    const allIds = new Set(
      participants
        .map((p) => (p.identity ? Number(p.identity) : null))
        .filter((id): id is number => id != null && !Number.isNaN(id)),
    )
    setSelectedIds(allIds)
  }, [participants])

  const handleStart = () => {
    const playerIds = Array.from(selectedIds)
    if (playerIds.length >= 6) {
      onStartGame(playerIds)
      onClose()
    }
  }

  if (!isOpen) return null

  const playerList = participants
    .map((p) => ({
      id: p.identity ? Number(p.identity) : NaN,
      name: p.name ?? 'Unknown',
    }))
    .filter((p) => !Number.isNaN(p.id))

  const count = selectedIds.size
  const canStart = count >= 6

  return createPortal(
    <div
      ref={tooltipRef}
      className="fixed z-50 w-56 rounded-xl border shadow-2xl"
      style={{
        top: position.top,
        left: position.left,
        backgroundColor: 'var(--game-bg-elevated)',
        borderColor: 'var(--game-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Arrow pointing toward the anchor button */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${
          placement === 'above'
            ? 'bottom-0 translate-y-full'
            : 'top-0 -translate-y-full'
        }`}
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          ...(placement === 'above'
            ? { borderTop: '6px solid var(--game-bg-elevated)' }
            : { borderBottom: '6px solid var(--game-bg-elevated)' }),
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: 'var(--game-border)' }}
      >
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--game-text-primary)' }}
        >
          Select Players
        </span>
        <button
          type="button"
          onClick={selectAll}
          className="text-xs font-medium transition-opacity cursor-pointer hover:opacity-80"
          style={{ color: 'var(--game-periwinkle)' }}
        >
          Select All
        </button>
      </div>

      {/* Participant list */}
      <div
        className="max-h-48 overflow-hidden overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--game-border) transparent',
        }}
      >
        {playerList.map((p) => {
          const isSelected = selectedIds.has(p.id)
          const initial = p.name.charAt(0).toUpperCase()
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleParticipant(p.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors cursor-pointer hover:bg-white/[0.03]"
              style={{
                backgroundColor: isSelected
                  ? 'rgba(237, 184, 58, 0.06)'
                  : 'transparent',
              }}
            >
              {/* Checkbox */}
              <div
                className="h-4 w-4 rounded border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: isSelected
                    ? 'var(--game-gold)'
                    : 'transparent',
                  borderColor: isSelected
                    ? 'var(--game-gold)'
                    : 'rgba(243, 240, 232, 0.25)',
                }}
              >
                {isSelected && <Check className="h-3 w-3 text-black" />}
              </div>

              {/* Avatar initial */}
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                style={{
                  backgroundColor: 'rgba(243, 240, 232, 0.08)',
                  color: 'var(--game-text-primary)',
                }}
              >
                {initial}
              </div>

              {/* Name */}
              <span
                className="text-xs truncate"
                style={{ color: 'var(--game-text-primary)' }}
              >
                {p.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2.5 border-t"
        style={{ borderColor: 'var(--game-border)' }}
      >
        <button
          type="button"
          disabled={!canStart}
          onClick={handleStart}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            canStart ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          style={{
            color: canStart ? '#000' : 'var(--game-text-muted)',
            backgroundColor: canStart
              ? 'var(--game-gold)'
              : 'rgba(243, 240, 232, 0.06)',
          }}
        >
          <Play className="h-3.5 w-3.5" />
          Start Game ({count}/6)
        </button>
      </div>
    </div>,
    document.body,
  )
}
