import { useCallback } from "react"
import imageCompression from "browser-image-compression"
import type { MediaFile } from "../types"

export const useImageProcessor = (files: MediaFile[], setFiles: React.Dispatch<React.SetStateAction<MediaFile[]>>, updateFile: (index: number, updates: Partial<MediaFile>) => void, addToast: (message: string, type: "success" | "error" | "info") => void) => {
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

  const resizeImage = useCallback(async (index: number, width: number, height: number) => {
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
  }, [files, setFiles, addToast])

  return {
    resizeImage,
  }
}
