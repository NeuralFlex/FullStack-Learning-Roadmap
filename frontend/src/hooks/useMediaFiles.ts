import { useState, useCallback, useMemo } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import type { MediaFile } from "../types"

const MAX_VIDEO_SIZE_MB = parseInt(import.meta.env.VITE_MAX_VIDEO_SIZE_MB || "200")
const MAX_VIDEO_SIZE = MAX_VIDEO_SIZE_MB * 1024 * 1024

export const useMediaFiles = (ffmpegRef: React.RefObject<FFmpeg | null>, ffmpegLoaded: boolean, addToast: (message: string, type: "success" | "error" | "info") => void, setActiveTab?: (tab: string) => void) => {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  const updateFile = useCallback((index: number, updates: Partial<MediaFile>) => {
    setFiles(prev => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)))
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

  const uploadFiles = useCallback(async (uploadedFiles: File[]) => {
    // Check file types and switch tabs
    const hasImages = uploadedFiles.some(f => f.type.startsWith("image/"))
    const hasVideos = uploadedFiles.some(f => f.type.startsWith("video/"))

    if (hasImages && setActiveTab) {
      setActiveTab("images")
    } else if (hasVideos && setActiveTab) {
      setActiveTab("videos")
    }

    for (const file of uploadedFiles) {
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
      } else if (file.type.startsWith("video/")) {
        if (file.size > MAX_VIDEO_SIZE) {
          const errorFile: MediaFile = {
            file,
            preview: URL.createObjectURL(file),
            metadata: { size: file.size, type: file.type },
            processing: false,
            error: `Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum ${MAX_VIDEO_SIZE_MB}MB.`,
          }
          setFiles((prev) => prev.map((f) => (f.file === file ? errorFile : f)))
          addToast("Video file too large", "error")
        } else {
          const mediaFile = await processVideo(file)
          setFiles((prev) => prev.map((f) => (f.file === file ? mediaFile : f)))
        }
      }
    }
  }, [])

  const deleteFile = useCallback((index: number) => {
    const fileToDelete = files[index]
    URL.revokeObjectURL(fileToDelete.preview)
    if (fileToDelete.thumbnail) URL.revokeObjectURL(fileToDelete.thumbnail)
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [files])

  const downloadFile = useCallback((file: MediaFile) => {
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
  }, [addToast])

  const handleToggleExpand = useCallback((index: number) => {
    setExpandedCard(prev => (prev === index ? null : index))
  }, [])

  const getFilteredFiles = useMemo(() => (activeTab: string) => {
    if (activeTab === "images") return files.filter((f) => f.file.type.startsWith("image/"))
    if (activeTab === "videos") return files.filter((f) => f.file.type.startsWith("video/"))
    return files
  }, [files])

  return {
    files,
    setFiles,
    updateFile,
    expandedCard,
    uploadFiles,
    deleteFile,
    downloadFile,
    handleToggleExpand,
    getFilteredFiles,
  }
}
