import React from "react"
import { UploadDropzone } from "./UploadDropzone"
import { SectionHeader } from "./SectionHeader"

interface DashboardSectionProps {
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onFilesSelected: (files: FileList | null) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  ffmpegLoaded: boolean
}

export const DashboardSection: React.FC<DashboardSectionProps> = React.memo(({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFilesSelected,
  fileInputRef,
  ffmpegLoaded,
}) => {
  return (
    <section className="dashboard-section">
      <SectionHeader title="Dashboard" description="Welcome to Media Processing App - Your all-in-one media toolkit" />

      <div className="upload-section">
        <UploadDropzone
          isDragging={isDragging}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onFilesSelected={onFilesSelected}
          fileInputRef={fileInputRef}
          hint="Supported: Images (JPG, PNG, GIF) • Videos (MP4, MOV, AVI)"
        />

        {!ffmpegLoaded && (
          <div className="loading-banner">
            <span className="spinner"></span>
            Initializing FFmpeg for video processing...
          </div>
        )}
      </div>
    </section>
  )
})
