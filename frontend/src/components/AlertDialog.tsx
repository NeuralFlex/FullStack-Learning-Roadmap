import type React from "react"

interface AlertDialogProps {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  open,
  onOpenChange,
}) => {
  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="alert-dialog-backdrop"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="alert-dialog">
        <div className="alert-dialog-content">
          <div className="alert-dialog-header">
            <h2 className="alert-dialog-title">{title}</h2>
          </div>

          {description && (
            <div className="alert-dialog-description">
              {description}
            </div>
          )}

          <div className="alert-dialog-actions">
            {cancelText && (
              <button
                className="alert-dialog-cancel"
                onClick={handleCancel}
              >
                {cancelText}
              </button>
            )}
            <button
              className="alert-dialog-confirm"
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
