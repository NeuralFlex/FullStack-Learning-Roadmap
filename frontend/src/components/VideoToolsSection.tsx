import React, { useMemo } from "react"
import { UploadDropzone } from "./UploadDropzone"
import { MediaCard } from "./MediaCard"
import type { MediaFile } from "../types"

interface VideoToolsSectionProps {
  files: MediaFile[]
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onFilesSelected: (files: FileList | null) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  expandedCard?: number | null
  ffmpegLoaded: boolean
  onTrim: (index: number, start: number, end: number) => void
  onDelete: (index: number) => void
  onDownload: (file: MediaFile) => void
  onToggleExpand: (index: number) => void
}

export const VideoToolsSection: React.FC<VideoToolsSectionProps> = React.memo(({
  files,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFilesSelected,
  fileInputRef,
  expandedCard,
  ffmpegLoaded,
  onTrim,
  onDelete,
  onDownload,
  onToggleExpand,
}) => {
  const videoFiles = useMemo(() =>
    files.filter((f) => f.file.type.startsWith("video/")),
    [files]
  )

  return (
    <section className="tools-section">
      <div className="section-header">
        <h1>Video Tools</h1>
        <p>Trim and process your videos</p>
      </div>

      <div className="upload-section">
        <UploadDropzone
          isDragging={isDragging}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onFilesSelected={onFilesSelected}
          fileInputRef={fileInputRef}
          hint="Supported: Videos (MP4, MOV, AVI)"
        />
      </div>

      {videoFiles.length === 0 ? (
        <div className="empty-state">
          <p>No videos uploaded yet. Drag and drop videos or click to browse.</p>
        </div>
      ) : (
        <div className="media-grid">
          {videoFiles.map((file) => {
            const realIdx = files.indexOf(file)

            return (
              <MediaCard
                key={realIdx}
                file={file}
                realIdx={realIdx}
                expandedCard={expandedCard}
                ffmpegLoaded={ffmpegLoaded}
                onTrim={onTrim}
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

VideoToolsSection.displayName = 'VideoToolsSection'
