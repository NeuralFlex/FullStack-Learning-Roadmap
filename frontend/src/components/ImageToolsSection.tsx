import React, { useMemo } from "react"
import { UploadDropzone } from "./UploadDropzone"
import { MediaCard } from "./MediaCard"
import type { MediaFile } from "../types"

interface ImageToolsSectionProps {
  files: MediaFile[]
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onFilesSelected: (files: FileList | null) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  expandedCard?: number | null
  ffmpegLoaded: boolean
  onResize: (index: number, width: number, height: number) => void
  onDelete: (index: number) => void
  onDownload: (file: MediaFile) => void
  onToggleExpand: (index: number) => void
}

export const ImageToolsSection: React.FC<ImageToolsSectionProps> = React.memo(({
  files,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFilesSelected,
  fileInputRef,
  expandedCard,
  ffmpegLoaded,
  onResize,
  onDelete,
  onDownload,
  onToggleExpand,
}) => {
  const imageFiles = useMemo(() =>
    files.filter((f) => f.file.type.startsWith("image/")),
    [files]
  )

  return (
    <section className="tools-section">
      <div className="section-header">
        <h1>Image Tools</h1>
        <p>Resize and compress your images</p>
      </div>

      <div className="upload-section">
        <UploadDropzone
          isDragging={isDragging}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onFilesSelected={onFilesSelected}
          fileInputRef={fileInputRef}
        />
      </div>

      {imageFiles.length === 0 ? (
        <div className="empty-state">
          <p>No images uploaded yet. Drag and drop images or click to browse.</p>
        </div>
      ) : (
        <div className="media-grid">
          {imageFiles.map((file) => {
            const realIdx = files.indexOf(file)

            return (
              <MediaCard
                key={realIdx}
                file={file}
                realIdx={realIdx}
                expandedCard={expandedCard}
                ffmpegLoaded={ffmpegLoaded}
                onResize={onResize}
                onDelete={onDelete}
                onDownload={onDownload}
                onToggleExpand={() => onToggleExpand(realIdx)}
              />
            )
          })}
        </div>
      )}
    </section>
  )
})
