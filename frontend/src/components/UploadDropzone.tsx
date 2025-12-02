"use client"

import React from "react"

interface UploadDropzoneProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  ffmpegLoaded: boolean
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onFileSelect, fileInputRef, ffmpegLoaded }) => {
  const [isDragging, setIsDragging] = React.useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files
      const event = new Event("change", { bubbles: true })
      fileInputRef.current.dispatchEvent(event as any)
      onFileSelect({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <div className="upload-section">
      <div
        className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={onFileSelect}
          style={{ display: "none" }}
        />

        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <h3>Drag & drop your files here</h3>
          <p>or click to browse</p>
          <p className="upload-hint">Supported: Images (JPG, PNG, GIF) • Videos (MP4, MOV, AVI)</p>
        </div>
      </div>

      {!ffmpegLoaded && (
        <div className="loading-banner">
          <span className="spinner"></span>
          Initializing FFmpeg for video processing...
        </div>
      )}
    </div>
  )
}

export default UploadDropzone
