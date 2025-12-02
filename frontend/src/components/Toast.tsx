import type React from "react"

interface ToastProps {
  message: string
  type: "success" | "error" | "info"
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === "success" && "✓"}
        {type === "error" && "✕"}
        {type === "info" && "ℹ"}
      </span>
      <span className="toast-message">{message}</span>
    </div>
  )
}

export default Toast
