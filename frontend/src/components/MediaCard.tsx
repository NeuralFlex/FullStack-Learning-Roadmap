"use client"

import type React from "react"
import { useState } from "react"

interface MediaCardProps {
  file: any
  index: number
  isImage: boolean
  onResize?: (index: number, width: number, height: number) => void
  onTrim?: (index: number, start: number, end: number) => void
  onDelete: (index: number) => void
  onDownload: (file: any) => void
  ffmpegLoaded?: boolean
}

const MediaCard: React.FC<MediaCardProps> = ({
  file,
  index,
  isImage,
  onResize,
  onTrim,
  onDelete,
  onDownload,
  ffmpegLoaded,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [resizeWidth, setResizeWidth] = useState(file.metadata.dimensions?.width || 800)
  const [resizeHeight, setResizeHeight] = useState(file.metadata.dimensions?.height || 600)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(file.metadata.duration || 0)
  const [maintainRatio, setMaintainRatio] = useState(false)

  const handleResizePreset = (width: number, height: number) => {
    setResizeWidth(width)
    setResizeHeight(height)
  }

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = Number.parseInt(e.target.value) || 800
    setResizeWidth(width)

    if (maintainRatio && file.metadata.dimensions) {
      const ratio = file.metadata.dimensions.height / file.metadata.dimensions.width
      setResizeHeight(Math.round(width * ratio))
    }
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const height = Number.parseInt(e.target.value) || 600
    setResizeHeight(height)

    if (maintainRatio && file.metadata.dimensions) {
      const ratio = file.metadata.dimensions.width / file.metadata.dimensions.height
      setResizeWidth(Math.round(height * ratio))
    }
  }

  return (
    <div className="media-card">
      <div className="card-preview">
        <img
          src={isImage ? file.preview : file.thumbnail || file.preview}
          alt={file.file.name}
          className="preview-image"
        />
        {file.processing && <div className="processing-overlay">Processing...</div>}
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="file-name">{file.file.name}</h3>
          {file.error && <span className="error-badge">Error</span>}
        </div>

        <div className="card-metadata">
          <p className="file-size">
            {(file.file.size / 1024 / 1024).toFixed(2)} MB
            {(file.processedImage || file.processedVideo) &&
              ` → ${((file.processedImage?.size || file.processedVideo?.size || file.file.size) / 1024 / 1024).toFixed(2)} MB`}
          </p>
          {file.metadata.dimensions && (
            <p className="file-dimensions">
              {file.metadata.dimensions.width} × {file.metadata.dimensions.height}
              {file.metadata.duration && ` • ${file.metadata.duration.toFixed(1)}s`}
            </p>
          )}
        </div>

        {file.error && <div className="error-message">{file.error}</div>}

        {isImage && !file.processing && (
          <div className="card-controls">
            <button className="preset-btn" onClick={() => handleResizePreset(1920, 1080)}>
              1080p
            </button>
            <button className="preset-btn" onClick={() => handleResizePreset(1280, 720)}>
              720p
            </button>
            <button className="preset-btn" onClick={() => handleResizePreset(800, 600)}>
              Standard
            </button>
          </div>
        )}

        {showAdvanced && isImage && (
          <div className="advanced-controls">
            <div className="dimension-inputs">
              <input type="number" value={resizeWidth} onChange={handleWidthChange} placeholder="Width" />
              <span>×</span>
              <input type="number" value={resizeHeight} onChange={handleHeightChange} placeholder="Height" />
            </div>
            <label className="checkbox-label">
              <input type="checkbox" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} />
              <span>Maintain aspect ratio</span>
            </label>
            <button
              className="action-btn resize-btn"
              onClick={() => onResize?.(index, resizeWidth, resizeHeight)}
              disabled={file.processing}
            >
              Resize Image
            </button>
          </div>
        )}

        {!isImage && ffmpegLoaded && !file.processing && (
          <div className="advanced-controls">
            <div className="trim-inputs">
              <label>
                <span>Start (s)</span>
                <input
                  type="number"
                  value={trimStart}
                  onChange={(e) => setTrimStart(Number.parseFloat(e.target.value) || 0)}
                  min="0"
                  max={file.metadata.duration}
                  step="0.1"
                />
              </label>
              <label>
                <span>End (s)</span>
                <input
                  type="number"
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(Number.parseFloat(e.target.value) || file.metadata.duration)}
                  min="0"
                  max={file.metadata.duration}
                  step="0.1"
                />
              </label>
            </div>
            <button
              className="action-btn trim-btn"
              onClick={() => onTrim?.(index, trimStart, trimEnd)}
              disabled={file.processing}
            >
              Trim Video
            </button>
          </div>
        )}

        <div className="card-actions">
          {(isImage || !ffmpegLoaded) && (
            <button className="action-btn toggle-btn" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? "▼" : "▶"} {isImage ? "Resize" : "Edit"}
            </button>
          )}
          <button
            className="action-btn download-btn"
            onClick={() => onDownload(file)}
            disabled={!file.processedImage && !file.processedVideo}
          >
            ⬇ Download
          </button>
          <button className="action-btn delete-btn" onClick={() => onDelete(index)}>
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default MediaCard
