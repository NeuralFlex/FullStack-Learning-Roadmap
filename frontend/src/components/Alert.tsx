import React from "react"

type AlertType = "success" | "error" | "warning" | "info"

interface AlertProps {
  type?: AlertType
  title?: string
  message: string
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  message,
  className = ""
}) => {
  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ"
  }

  return (
    <div className={`alert alert-${type} ${className}`.trim()}>
      <span className="alert-icon">{icons[type]}</span>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{message}</div>
      </div>
    </div>
  )
}
