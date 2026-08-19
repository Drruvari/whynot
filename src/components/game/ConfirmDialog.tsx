import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { GameButton } from "@/components/game/GameButton"

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel,
  confirmLabel,
  cancelTone = "go",
  confirmTone = "danger",
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  cancelLabel: string
  confirmLabel: string
  cancelTone?: "go" | "danger" | "secret" | "muted"
  confirmTone?: "go" | "danger" | "secret" | "muted"
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="inset-x-0 top-auto bottom-0 w-full max-w-none translate-none p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ring-0 data-[size=default]:max-w-none data-[size=sm]:max-w-none data-[size=default]:sm:max-w-none data-open:slide-in-from-bottom-4 data-closed:slide-out-to-bottom-4">
        <AlertDialogHeader className="place-items-center text-center sm:place-items-center sm:text-center">
          <AlertDialogTitle className="font-display text-2xl font-extrabold tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
          <GameButton tone={cancelTone} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </GameButton>
          <GameButton
            tone={confirmTone}
            onClick={() => {
              onOpenChange(false)
              onConfirm()
            }}
          >
            {confirmLabel}
          </GameButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
