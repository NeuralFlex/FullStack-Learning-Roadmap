import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import imageCompression from "browser-image-compression"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import "./styles/media-app.css"

// Types for our application
interface MediaFile {
  file: File
  preview: string
  thumbnail?: string
  processedImage?: Blob
  processedVideo?: Blob
  metadata: {
    size: number
    type: string
    duration?: number
    dimensions?: { width: number; height: number }
  }
  trim?: { start: number; end: number }
  resizeOpts?: { width: number; height: number; maintainRatio: boolean }
  processing: boolean
  error?: string
}

interface AppToast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

export default function MediaProcessingApp() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [toasts, setToasts] = useState<AppToast[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpeg = new FFmpeg()
        await ffmpeg.load()
        ffmpegRef.current = ffmpeg
        setFfmpegLoaded(true)
        addToast("FFmpeg loaded successfully", "success")
      } catch (error) {
        console.error("Failed to load FFmpeg:", error)
        addToast("Failed to load FFmpeg", "error")
      }
    }
    loadFFmpeg()
  }, [])

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    const MAX_VIDEO_SIZE = 200 * 1024 * 1024

    for (const file of selectedFiles) {
      const initialFile: MediaFile = {
        file,
        preview: URL.createObjectURL(file),
        metadata: { size: file.size, type: file.type },
        processing: true,
        error: undefined,
      }

      setFiles((prev) => [...prev, initialFile])

      if (file.type.startsWith("image/")) {
        const mediaFile = await processImage(file)
        setFiles((prev) => prev.map((f) => (f.file === file ? mediaFile : f)))
        setActiveTab("images")
      } else if (file.type.startsWith("video/")) {
        if (file.size > MAX_VIDEO_SIZE) {
          const errorFile: MediaFile = {
            file,
            preview: URL.createObjectURL(file),
            metadata: { size: file.size, type: file.type },
            processing: false,
            error: `Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum 200MB.`,
          }
          setFiles((prev) => prev.map((f) => (f.file === file ? errorFile : f)))
          addToast("Video file too large", "error")
        } else {
          const mediaFile = await processVideo(file)
          setFiles((prev) => prev.map((f) => (f.file === file ? mediaFile : f)))
          setActiveTab("videos")
        }
      }
    }

    if (event.target) event.target.value = ""
  }, [])

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.src = URL.createObjectURL(file)
    })
  }

  const getVideoMetadata = (
    file: File,
  ): Promise<{
    size: number
    type: string
    duration?: number
    dimensions?: { width: number; height: number }
  }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve({
          size: file.size,
          type: file.type,
          duration: video.duration,
          dimensions: { width: video.videoWidth, height: video.videoHeight },
        })
      }
      video.onerror = () => reject(new Error("Failed to load video metadata"))
      video.src = URL.createObjectURL(file)
    })
  }

  const extractVideoThumbnail = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      const video = document.createElement("video")
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      video.preload = "metadata"
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2)
      }

      video.onseeked = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            const thumbnail = blob ? URL.createObjectURL(blob) : undefined
            resolve(thumbnail)
            URL.revokeObjectURL(video.src)
          },
          "image/jpeg",
          0.8,
        )
      }

      video.src = URL.createObjectURL(file)
    })
  }

  const resizeImageWithCanvas = async (file: File, targetWidth: number, targetHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        canvas.width = targetWidth
        canvas.height = targetHeight

        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob"))
              }
            },
            "image/jpeg",
            0.9,
          )
        } else {
          reject(new Error("Failed to get canvas context"))
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  const processImage = async (file: File): Promise<MediaFile> => {
    const preview = URL.createObjectURL(file)
    const originalDimensions = await getImageDimensions(file)

    return {
      file,
      preview,
      metadata: {
        size: file.size,
        type: file.type,
        dimensions: originalDimensions,
      },
      processing: false,
    }
  }

  const resizeImage = async (index: number, width: number, height: number) => {
    const file = files[index]

    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, processing: true } : f)))

    try {
      const resizedBlob = await resizeImageWithCanvas(file.file, width, height)
      const resizedFile = new File([resizedBlob], "resized.jpg", { type: "image/jpeg" })

      const compressedFile = await imageCompression(resizedFile, {
        maxSizeMB: 10,
        useWebWorker: true,
        maxWidthOrHeight: Math.max(width, height),
      })

      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, processedImage: compressedFile, processing: false } : f)),
      )
      addToast("Image resized successfully", "success")
    } catch (error) {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, processing: false, error: "Failed to resize image" } : f)),
      )
      addToast("Failed to resize image", "error")
    }
  }

  const processVideo = async (file: File): Promise<MediaFile> => {
    const preview = URL.createObjectURL(file)

    try {
      const metadata = await getVideoMetadata(file)
      const thumbnail = await extractVideoThumbnail(file)

      return {
        file,
        preview,
        thumbnail,
        metadata,
        processing: false,
      }
    } catch (error) {
      return {
        file,
        preview,
        metadata: { size: file.size, type: file.type },
        processing: false,
        error: error instanceof Error ? error.message : "Failed to process video",
      }
    }
  }

  const trimVideo = async (index: number, start: number, end: number) => {
    const file = files[index]
    const ffmpeg = ffmpegRef.current

    if (!ffmpeg || !ffmpegLoaded) {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, processing: false, error: "FFmpeg not loaded" } : f)),
      )
      addToast("FFmpeg not loaded", "error")
      return
    }

    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, processing: true, trim: { start, end } } : f)))

    try {
      const inputName = `input_${file.file.name}`
      const fileData = await file.file.arrayBuffer()
      await ffmpeg.writeFile(inputName, new Uint8Array(fileData))

      const outputName = `output_${file.file.name}`

      await ffmpeg.exec([
        "-i",
        inputName,
        "-ss",
        start.toString(),
        "-t",
        (end - start).toString(),
        "-c",
        "copy",
        "-avoid_negative_ts",
        "make_zero",
        outputName,
      ])

      const data = (await ffmpeg.readFile(outputName)) as any
      const uint8Array = new Uint8Array(data)
      const trimmed = new Blob([uint8Array], { type: file.file.type })

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                processedVideo: trimmed,
                metadata: { ...f.metadata, size: trimmed.size },
                processing: false,
              }
            : f,
        ),
      )

      ffmpeg.deleteFile(inputName)
      ffmpeg.deleteFile(outputName)
      addToast("Video trimmed successfully", "success")
    } catch (error) {
      console.error("Trim error:", error)
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, processing: false, error: "Failed to trim video" } : f)),
      )
      addToast("Failed to trim video", "error")
    }
  }

  const deleteFile = (index: number) => {
    const fileToDelete = files[index]
    URL.revokeObjectURL(fileToDelete.preview)
    if (fileToDelete.thumbnail) URL.revokeObjectURL(fileToDelete.thumbnail)
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const downloadFile = (file: MediaFile) => {
    let blob: Blob | undefined
    let filename = file.file.name

    if (file.processedImage) {
      blob = file.processedImage
      filename = `processed_${file.file.name}`
    } else if (file.processedVideo) {
      blob = file.processedVideo
      filename = `trimmed_${file.file.name}`
    }

    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      addToast(`Downloaded ${filename}`, "success")
    }
  }

  const getFilteredFiles = () => {
    if (activeTab === "images") return files.filter((f) => f.file.type.startsWith("image/"))
    if (activeTab === "videos") return files.filter((f) => f.file.type.startsWith("video/"))
    return files
  }

  const filteredFiles = getFilteredFiles()
  const [isDragging, setIsDragging] = useState(false)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [resizeStates, setResizeStates] = useState<{
    [key: number]: { width: number; height: number; ratio: boolean }
  }>({})
  const [trimStates, setTrimStates] = useState<{ [key: number]: { start: number; end: number } }>({})

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
    const syntheticEvent = {
      target: { files: e.dataTransfer.files },
    } as React.ChangeEvent<HTMLInputElement>
    handleFileUpload(syntheticEvent)
  }

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="app-logo">
            <span className="logo-icon">🎨</span>
            {sidebarOpen && <span className="logo-text">MPA</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "images", label: "Image Tools", icon: "🖼️" },
            { id: "videos", label: "Video Tools", icon: "🎬" },
            { id: "settings", label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="main-wrapper">
        {/* TOP NAV */}
        <header className="top-nav">
          <div className="nav-content">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar">
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <h2 className="page-title">
              {activeTab === "dashboard" && "Media Processing App"}
              {activeTab === "images" && "Image Tools"}
              {activeTab === "videos" && "Video Tools"}
              {activeTab === "settings" && "Settings"}
            </h2>
            <div className="nav-spacer"></div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="main-content">
          {activeTab === "dashboard" && (
            <section className="dashboard-section">
              <div className="section-header">
                <h1>Dashboard</h1>
                <p>Welcome to Media Processing App - Your all-in-one media toolkit</p>
              </div>

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
                    onChange={handleFileUpload}
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
            </section>
          )}

          {activeTab === "images" && (
            <section className="tools-section">
              <div className="section-header">
                <h1>Image Tools</h1>
                <p>Resize and compress your images</p>
              </div>

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
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <div className="upload-content">
                    <div className="upload-icon">📁</div>
                    <h3>Drag & drop your files here</h3>
                    <p>or click to browse</p>
                    <p className="upload-hint">Supported: Images (JPG, PNG, GIF) • Videos (MP4, MOV, AVI)</p>
                  </div>
                </div>
              </div>

              {filteredFiles.length === 0 ? (
                <div className="empty-state">
                  <p>No images uploaded yet. Drag and drop images or click to browse.</p>
                </div>
              ) : (
                <div className="media-grid">
                  {filteredFiles.map((file, idx) => {
                    const realIdx = files.indexOf(file)
                    const state = resizeStates[realIdx] || {
                      width: file.metadata.dimensions?.width || 800,
                      height: file.metadata.dimensions?.height || 600,
                      ratio: false,
                    }

                    return (
                      <div key={realIdx} className="media-card">
                        <div className="card-preview">
                          <img
                            src={file.preview || "/placeholder.svg"}
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
                              {file.processedImage && ` → ${(file.processedImage.size / 1024 / 1024).toFixed(2)} MB`}
                            </p>
                            {file.metadata.dimensions && (
                              <p className="file-dimensions">
                                {file.metadata.dimensions.width} × {file.metadata.dimensions.height}
                              </p>
                            )}
                          </div>

                          {file.error && <div className="error-message">{file.error}</div>}

                          <div className="card-controls">
                            <button
                              className="preset-btn"
                              onClick={() =>
                                setResizeStates({ ...resizeStates, [realIdx]: { ...state, width: 1920, height: 1080 } })
                              }
                            >
                              1080p
                            </button>
                            <button
                              className="preset-btn"
                              onClick={() =>
                                setResizeStates({ ...resizeStates, [realIdx]: { ...state, width: 1280, height: 720 } })
                              }
                            >
                              720p
                            </button>
                            <button
                              className="preset-btn"
                              onClick={() =>
                                setResizeStates({ ...resizeStates, [realIdx]: { ...state, width: 800, height: 600 } })
                              }
                            >
                              Standard
                            </button>
                          </div>

                          {expandedCard === realIdx && (
                            <div className="advanced-controls">
                              <div className="dimension-inputs">
                                <input
                                  type="number"
                                  value={state.width}
                                  onChange={(e) =>
                                    setResizeStates({
                                      ...resizeStates,
                                      [realIdx]: { ...state, width: Number.parseInt(e.target.value) || 800 },
                                    })
                                  }
                                  placeholder="Width"
                                />
                                <span>×</span>
                                <input
                                  type="number"
                                  value={state.height}
                                  onChange={(e) =>
                                    setResizeStates({
                                      ...resizeStates,
                                      [realIdx]: { ...state, height: Number.parseInt(e.target.value) || 600 },
                                    })
                                  }
                                  placeholder="Height"
                                />
                              </div>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={state.ratio}
                                  onChange={(e) =>
                                    setResizeStates({
                                      ...resizeStates,
                                      [realIdx]: { ...state, ratio: e.target.checked },
                                    })
                                  }
                                />
                                <span>Maintain aspect ratio</span>
                              </label>
                              <button
                                className="action-btn resize-btn"
                                onClick={() => resizeImage(realIdx, state.width, state.height)}
                                disabled={file.processing}
                              >
                                Resize Image
                              </button>
                            </div>
                          )}

                          <div className="card-actions">
                            <button
                              className="action-btn toggle-btn"
                              onClick={() => setExpandedCard(expandedCard === realIdx ? null : realIdx)}
                            >
                              {expandedCard === realIdx ? "▼" : "▶"} Resize
                            </button>
                            <button
                              className="action-btn download-btn"
                              onClick={() => downloadFile(file)}
                              disabled={!file.processedImage}
                            >
                              ⬇ Download
                            </button>
                            <button className="action-btn delete-btn" onClick={() => deleteFile(realIdx)}>
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === "videos" && (
            <section className="tools-section">
              <div className="section-header">
                <h1>Video Tools</h1>
                <p>Trim and process your videos</p>
              </div>

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
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <div className="upload-content">
                    <div className="upload-icon">📁</div>
                    <h3>Drag & drop your files here</h3>
                    <p>or click to browse</p>
                    <p className="upload-hint">Supported: Videos (MP4, MOV, AVI)</p>
                  </div>
                </div>
              </div>

              {filteredFiles.length === 0 ? (
                <div className="empty-state">
                  <p>No videos uploaded yet. Drag and drop videos or click to browse.</p>
                </div>
              ) : (
                <div className="media-grid">
                  {filteredFiles.map((file, idx) => {
                    const realIdx = files.indexOf(file)
                    const state = trimStates[realIdx] || { start: 0, end: file.metadata.duration || 0 }

                    return (
                      <div key={realIdx} className="media-card">
                        <div className="card-preview">
                          <img src={file.thumbnail || file.preview} alt={file.file.name} className="preview-image" />
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

                          {ffmpegLoaded && expandedCard === realIdx && (
                            <div className="advanced-controls">
                              <div className="trim-inputs">
                                <label>
                                  <span>Start (s)</span>
                                  <input
                                    type="number"
                                    value={state.start}
                                    onChange={(e) =>
                                      setTrimStates({
                                        ...trimStates,
                                        [realIdx]: { ...state, start: Number.parseFloat(e.target.value) || 0 },
                                      })
                                    }
                                    min="0"
                                    max={file.metadata.duration}
                                    step="0.1"
                                  />
                                </label>
                                <label>
                                  <span>End (s)</span>
                                  <input
                                    type="number"
                                    value={state.end}
                                    onChange={(e) =>
                                      setTrimStates({
                                        ...trimStates,
                                        [realIdx]: {
                                          ...state,
                                          end: Number.parseFloat(e.target.value) || file.metadata.duration || 0,
                                        },
                                      })
                                    }
                                    min="0"
                                    max={file.metadata.duration}
                                    step="0.1"
                                  />
                                </label>
                              </div>
                              <button
                                className="action-btn trim-btn"
                                onClick={() => trimVideo(realIdx, state.start, state.end)}
                                disabled={file.processing}
                              >
                                Trim Video
                              </button>
                            </div>
                          )}

                          <div className="card-actions">
                            {ffmpegLoaded && (
                              <button
                                className="action-btn toggle-btn"
                                onClick={() => setExpandedCard(expandedCard === realIdx ? null : realIdx)}
                              >
                                {expandedCard === realIdx ? "▼" : "▶"} Edit
                              </button>
                            )}
                            <button
                              className="action-btn download-btn"
                              onClick={() => downloadFile(file)}
                              disabled={!file.processedVideo}
                            >
                              ⬇ Download
                            </button>
                            <button className="action-btn delete-btn" onClick={() => deleteFile(realIdx)}>
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === "settings" && (
            <section className="settings-section">
              <div className="section-header">
                <h1>Settings</h1>
                <p>Configure your preferences</p>
              </div>
              <div className="settings-card">
                <h3>About Media Processing App</h3>
                <p>Version 1.0.0</p>
                <p>
                  A modern web-based media processing tool for images and videos with advanced editing capabilities.
                </p>
              </div>
            </section>
          )}
        </main>

        {/* TOAST NOTIFICATIONS */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <span className="toast-icon">
                {toast.type === "success" && "✓"}
                {toast.type === "error" && "✕"}
                {toast.type === "info" && "ℹ"}
              </span>
              <span className="toast-message">{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
