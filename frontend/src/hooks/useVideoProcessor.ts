import { useCallback } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import type { MediaFile } from "../types"

export const useVideoProcessor = (files: MediaFile[], setFiles: React.Dispatch<React.SetStateAction<MediaFile[]>>, updateFile: (index: number, updates: Partial<MediaFile>) => void, ffmpegRef: React.RefObject<FFmpeg | null>, ffmpegLoaded: boolean, addToast: (message: string, type: "success" | "error" | "info") => void) => {
  const trimVideo = useCallback(async (index: number, start: number, end: number) => {
    const file = files[index]
    const ffmpeg = ffmpegRef.current

    if (!ffmpeg || !ffmpegLoaded) {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, processing: false, error: "FFmpeg not loaded" } : f)),
      )
      addToast("FFmpeg not loaded", "error")
      return
    }

    // Validate trim parameters
    const duration = file.metadata.duration || 0
    if (start < 0 || end > duration || end <= start) {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, processing: false, error: "Invalid trim parameters. End must be greater than start and within video duration." } : f)),
      )
      addToast("Invalid trim parameters", "error")
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

      const data = await ffmpeg.readFile(outputName) as Uint8Array
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
  }, [files, setFiles, ffmpegRef, ffmpegLoaded, addToast])

  return {
    trimVideo,
  }
}
