import { useState, useEffect, useRef } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"

export const useFFmpeg = (addToast: (message: string, type: "success" | "error" | "info") => void) => {
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
  }, [addToast])

  return {
    ffmpegRef,
    ffmpegLoaded,
  }
}
