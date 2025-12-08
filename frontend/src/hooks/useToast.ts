import { useState, useCallback } from "react"
import type { AppToast } from "../types"

export const useToast = () => {
  const [toasts, setToasts] = useState<AppToast[]>([])

  const addToast = useCallback((message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
  }
}
