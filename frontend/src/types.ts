export interface MediaFile {
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

export interface AppToast {
  id: string
  message: string
  type: "success" | "error" | "info"
}
