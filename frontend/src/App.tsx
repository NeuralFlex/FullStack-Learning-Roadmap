"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import "./App.css"
import imageCompression from "browser-image-compression"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import Sidebar from "./components/Sidebar"
import TopNav from "./components/TopNav"
import UploadDropzone from "./components/UploadDropzone"
import MediaCard from "./components/MediaCard"
import ToastComponent from "./components/Toast"

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

const App: React.FC = () => {
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
    const MAX_VIDEO_SIZE = 200 * 1024 * 1024 // 200MB limit for videos

    for (const file of selectedFiles) {
      const initialFile: MediaFile = {
        file,
        preview: URL.createObjectURL(file),
        metadata: {
          size: file.size,
          type: file.type,
        },
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
            metadata: {
              size: file.size,
              type: file.type,
            },
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

    // Clear the input
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
        video.currentTime = Math.min(1, video.duration / 2) // Seek to 1s or halfway
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
          // Draw image scaled to fit the target dimensions
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

    // Get original image dimensions
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

      // Apply additional compression
      const compressedFile = await imageCompression(resizedFile, {
        maxSizeMB: 10, // Allow larger files for better quality
        useWebWorker: true,
        maxWidthOrHeight: Math.max(width, height),
      })

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                processedImage: compressedFile,
                processing: false,
              }
            : f,
        ),
      )
      addToast("Image resized successfully", "success")
    } catch (error) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                processing: false,
                error: "Failed to resize image",
              }
            : f,
        ),
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
        metadata: {
          size: file.size,
          type: file.type,
        },
        processing: false,
        error: error instanceof Error ? error.message : "Failed to process video",
      }
    }
  }

  const trimVideo = async (index: number, start: number, end: number) => {
    const file = files[index]
    const ffmpeg = ffmpegRef.current

    if (!ffmpeg || !ffmpegLoaded) {
      // Update file with error
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, processing: false, error: "FFmpeg not loaded" } : f)),
      )
      addToast("FFmpeg not loaded", "error")
      return
    }

    // Update processing state
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, processing: true, trim: { start, end } } : f)))

    try {
      // Write file to FFmpeg FS
      const inputName = `input_${file.file.name}`
      const fileData = await file.file.arrayBuffer()
      await ffmpeg.writeFile(inputName, new Uint8Array(fileData))

      const outputName = `output_${file.file.name}`

      // Run FFmpeg trim command (copy streams for speed, no re-encoding)
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

      // Update file with processed video
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

      // Clean up
      ffmpeg.deleteFile(inputName)
      ffmpeg.deleteFile(outputName)
      addToast("Video trimmed successfully", "success")
    } catch (error) {
      console.error("Trim error:", error)
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                processing: false,
                error: "Failed to trim video",
              }
            : f,
        ),
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

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} fileCount={files.length} />
      <div className="main-wrapper">
        <TopNav setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} activeTab={activeTab} />

        <main className="main-content">
          {activeTab === "dashboard" && (
            <section className="dashboard-section">
              <div className="section-header">
                <h1>Dashboard</h1>
                <p>Welcome to Media Processing App - Your all-in-one media toolkit</p>
              </div>
              <UploadDropzone onFileSelect={handleFileUpload} fileInputRef={fileInputRef} ffmpegLoaded={ffmpegLoaded} />
            </section>
          )}

          {activeTab === "images" && (
            <section className="tools-section">
              <div className="section-header">
                <h1>Image Tools</h1>
                <p>Resize and compress your images</p>
              </div>
              <UploadDropzone onFileSelect={handleFileUpload} fileInputRef={fileInputRef} ffmpegLoaded={ffmpegLoaded} />

              {filteredFiles.length === 0 ? (
                <div className="empty-state">
                  <p>No images uploaded yet. Drag and drop images or click to browse.</p>
                </div>
              ) : (
                <div className="media-grid">
                  {filteredFiles.map((file, index) => (
                    <MediaCard
                      key={index}
                      file={file}
                      index={files.indexOf(file)}
                      isImage={true}
                      onResize={resizeImage}
                      onDelete={deleteFile}
                      onDownload={downloadFile}
                    />
                  ))}
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
              <UploadDropzone onFileSelect={handleFileUpload} fileInputRef={fileInputRef} ffmpegLoaded={ffmpegLoaded} />

              {filteredFiles.length === 0 ? (
                <div className="empty-state">
                  <p>No videos uploaded yet. Drag and drop videos or click to browse.</p>
                </div>
              ) : (
                <div className="media-grid">
                  {filteredFiles.map((file, index) => (
                    <MediaCard
                      key={index}
                      file={file}
                      index={files.indexOf(file)}
                      isImage={false}
                      onTrim={trimVideo}
                      onDelete={deleteFile}
                      onDownload={downloadFile}
                      ffmpegLoaded={ffmpegLoaded}
                    />
                  ))}
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
                <p>A modern web-based media processing tool for images and videos.</p>
              </div>
            </section>
          )}
        </main>

        <div className="toast-container">
          {toasts.map((toast) => (
            <ToastComponent key={toast.id} message={toast.message} type={toast.type} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
