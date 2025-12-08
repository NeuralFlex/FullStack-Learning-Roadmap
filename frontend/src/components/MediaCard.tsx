import React from "react"
import { CardPreview } from "./CardPreview"
import { CardContent } from "./CardContent"
import { ResizeControls } from "./ResizeControls"
import { TrimControls } from "./TrimControls"
import type { MediaFile } from "../types"

interface MediaCardProps {
  file: MediaFile
  realIdx: number
  expandedCard?: number | null
  ffmpegLoaded?: boolean
  onResize?: (index: number, width: number, height: number) => void
  onTrim?: (index: number, start: number, end: number) => void
  onDelete: (index: number) => void
  onDownload: (file: MediaFile) => void
  onToggleExpand: () => void
}

export const MediaCard: React.FC<MediaCardProps> = React.memo(({
  file,
  realIdx,
  expandedCard,
  ffmpegLoaded = false,
  onResize,
  onTrim,
  onDelete,
  onDownload,
  onToggleExpand,
}) => {
  const isImage = file.file.type.startsWith("image/")

  return (
    <div className="media-card">
      <CardPreview file={file} />

      <CardContent
        file={file}
        onDelete={() => onDelete(realIdx)}
        onDownload={() => onDownload(file)}
      >
        {expandedCard === realIdx && (
          <>
            {isImage && onResize && (
              <ResizeControls
                file={file}
                onResize={onResize}
                realIdx={realIdx}
              />
            )}
            {!isImage && ffmpegLoaded && onTrim && (
              <TrimControls
                file={file}
                onTrim={onTrim}
                realIdx={realIdx}
              />
            )}
          </>
        )}

        <div className="card-actions">
          {(ffmpegLoaded || isImage) && (
            <button className="toggle-action-btn" onClick={onToggleExpand}>
              {expandedCard === realIdx ? "▼" : "▶"} {isImage ? "Resize" : "Edit"}
            </button>
          )}
          <button
            className="download-action-btn"
            onClick={() => onDownload(file)}
            disabled={!file.processedImage && !file.processedVideo}
          >
            ⬇ Download
          </button>
          <button className="delete-action-btn" onClick={() => onDelete(realIdx)}>
            🗑 Delete
          </button>
        </div>
      </CardContent>
    </div>
  )
})

MediaCard.displayName = 'MediaCard'
