import axios from 'axios';
import type {
  CloudFile,
  UploadURLRequest,
  UploadURLResponse,
  DownloadURLResponse,
  ListFilesResponse,
  DeleteResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Endpoints
export const apiEndpoints = {
  listFiles: '/media/files',
  uploadUrl: '/media/upload-url',
  downloadUrl: (key: string) => `/media/download-url/${encodeURIComponent(key)}`,
  deleteFile: (key: string) => `/media/files/${encodeURIComponent(key)}`,
};

/**
 * Fetch all files from the S3 bucket
 */
export const fetchFiles = async (): Promise<CloudFile[]> => {
  try {
    const response = await api.get<ListFilesResponse>(apiEndpoints.listFiles);
    return response.data.objects;
  } catch (error) {
    console.error('Error fetching files:', error);
    throw new Error('Failed to fetch files from cloud storage');
  }
};

/**
 * Generate a presigned upload URL for a file
 */
export const generateUploadUrl = async (request: UploadURLRequest): Promise<UploadURLResponse> => {
  try {
    const response = await api.post<UploadURLResponse>(apiEndpoints.uploadUrl, {
      filename: request.filename,
      content_type: request.contentType || 'application/octet-stream',
    });
    return response.data;
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

/**
 * Generate a presigned download URL for a file
 */
export const generateDownloadUrl = async (key: string): Promise<DownloadURLResponse> => {
  try {
    const response = await api.get<DownloadURLResponse>(apiEndpoints.downloadUrl(key));
    return response.data;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw new Error('Failed to generate download URL');
  }
};

/**
 * Delete a file from S3
 */
export const deleteFileApi = async (key: string): Promise<DeleteResponse> => {
  try {
    const response = await api.delete<DeleteResponse>(apiEndpoints.deleteFile(key));
    return response.data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
};

/**
 * Upload a file directly to S3 using presigned URL
 */
export const uploadFileToS3 = async (
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress(progress);
        }
      },
    });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
};

/**
 * Download a file using presigned URL with progress tracking
 */
export const downloadFileFromS3 = async (
  downloadUrl: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', downloadUrl, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          // Create a download link and trigger download
          const url = window.URL.createObjectURL(xhr.response);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up the blob URL to free memory
          window.URL.revokeObjectURL(url);

          resolve();
        } catch (error) {
          reject(new Error('Failed to create download link'));
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during download'));
    };

    xhr.send();
  });
};

/**
 * Utility function to determine if a file is a media file (image/video) for preview generation
 */
export const isMediaFile = (key: string): boolean => {
  const ext = key.toLowerCase().split('.').pop();
  return ext ? ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'].includes(ext) : false;
};

export default api;
