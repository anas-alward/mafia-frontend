import { TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  /** Danger actions render the confirm button in crimson. */
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Game-themed confirmation modal built on the shadcn Dialog (Radix).
 * Escape and overlay click cancel via onOpenChange; colors come from
 * the game tokens so it matches the live room.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent
        showCloseButton={false}
        className="w-full p-5 sm:max-w-xs"
        style={{
          backgroundColor: 'var(--game-bg-elevated)',
          borderColor: 'var(--game-border)',
        }}
      >
        <DialogHeader className="flex-row items-center gap-2.5 text-start">
          <TriangleAlert
            className="h-4 w-4 shrink-0"
            style={{
              color: danger ? 'var(--game-crimson)' : 'var(--game-gold)',
            }}
          />
          <DialogTitle
            className="text-sm font-semibold"
            style={{ color: 'var(--game-text-primary)' }}
          >
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription
          className="text-xs leading-relaxed"
          style={{ color: 'var(--game-text-muted)' }}
        >
          {description}
        </DialogDescription>
        <DialogFooter className="mt-4 gap-2">
          <DialogClose asChild>
            <button
              type="button"
              className="px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer hover:bg-white/[0.06]"
              style={{ color: 'var(--game-text-muted)' }}
            >
              {t('room.confirm.cancel')}
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer"
            style={{
              color: danger ? '#1B1922' : 'var(--game-gold)',
              backgroundColor: danger
                ? 'var(--game-crimson)'
                : 'rgba(237, 184, 58, 0.1)',
              borderColor: danger
                ? 'var(--game-crimson)'
                : 'rgba(237, 184, 58, 0.3)',
            }}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
