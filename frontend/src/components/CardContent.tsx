import type React from "react"
import type { MediaFile } from "../types"

interface CardContentProps {
  file: MediaFile
  onDelete: () => void
  onDownload: () => void
  children?: React.ReactNode
}



export const CardContent: React.FC<CardContentProps> = ({ file, onDelete, onDownload, children }) => {
  const isImage = file.file.type.startsWith("image/")

  return (
    <div className="card-content">
      <div className="card-header">
        <h3 className="file-name">{file.file.name}</h3>
        {file.error && <span className="error-badge">Error</span>}
      </div>

      <div className="card-metadata">
        <p className="file-size">
          {(file.file.size / 1024 / 1024).toFixed(2)} MB
          {file.processedImage && ` → ${(file.processedImage.size / 1024 / 1024).toFixed(2)} MB`}
          {file.processedVideo && ` → ${(file.processedVideo.size / 1024 / 1024).toFixed(2)} MB`}
        </p>
        {file.metadata.dimensions && (
          <p className="file-dimensions">
            {file.metadata.dimensions.width} × {file.metadata.dimensions.height}
            {file.metadata.duration && ` • ${file.metadata.duration.toFixed(1)}s`}
          </p>
        )}
      </div>

      {file.error && <div className="error-message">{file.error}</div>}

      {children}
    </div>
  )
}
