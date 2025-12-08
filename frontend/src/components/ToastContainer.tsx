import type React from "react"
import type { AppToast } from "../types"

interface ToastContainerProps {
  toasts: AppToast[]
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" && "✓"}
            {toast.type === "error" && "✕"}
            {toast.type === "info" && "ℹ"}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
