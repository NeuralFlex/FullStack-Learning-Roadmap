import type React from "react"

interface UploadDropzoneProps {
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onFilesSelected: (files: FileList | null) => void
  hint?: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFilesSelected,
  hint = "Supported: Images (JPG, PNG, GIF) • Videos (MP4, MOV, AVI)",
  fileInputRef,
}) => {
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => onFilesSelected(e.target.files)}
        style={{ display: "none" }}
      />
      <div className="upload-content">
        <div className="upload-icon">📁</div>
        <h3>Drag & drop your files here</h3>
        <p>or click to browse</p>
        <p className="upload-hint">{hint}</p>
      </div>
    </div>
  )
}
