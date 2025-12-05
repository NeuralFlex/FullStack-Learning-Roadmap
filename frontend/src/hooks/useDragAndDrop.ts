import { useState, useCallback, useRef } from "react"

export const useDragAndDrop = () => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFilesSelected = useCallback((files: FileList | null) => {
    if (files) {
      const syntheticEvent = {
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>
      return Array.from(files)
    }
    return []
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    return Array.from(e.dataTransfer.files)
  }, [])

  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      e.target.value = ""
      return files
    }
    return []
  }, [])

  return {
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleFilesSelected,
    handleDrop,
    handleFileInputClick,
    handleFileInputChange,
  }
}
