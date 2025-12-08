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

export interface CloudFile {
  key: string
  size: number
  lastModified: string
  etag: string
  previewUrl?: string
}

export interface UploadURLRequest {
  filename: string
  contentType?: string
}

export interface UploadURLResponse {
  upload_url: string
  key: string
  expires_in: number
}

export interface DownloadURLResponse {
  download_url: string
  key: string
  expires_in: number
}

export interface ListFilesResponse {
  objects: CloudFile[]
  count: number
}

export interface DeleteResponse {
  message: string
  key: string
}
