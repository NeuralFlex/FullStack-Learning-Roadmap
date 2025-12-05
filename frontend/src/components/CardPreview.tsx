import type React from "react"
import type { MediaFile } from "../types"

interface CardPreviewProps {
  file: MediaFile
}

export const CardPreview: React.FC<CardPreviewProps> = ({ file }) => {
  const imgSrc = file.thumbnail || file.preview

  return (
    <div className="card-preview">
      <img src={imgSrc} alt={file.file.name} className="preview-image" />
      {file.processing && <div className="processing-overlay">Processing...</div>}
    </div>
  )
}
