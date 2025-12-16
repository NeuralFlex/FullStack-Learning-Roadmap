import { useState, useCallback } from 'react';
import type { CloudFile, ProgressStatus } from '../types';
import { updateProgressByIndex, updateProgressByPredicate } from '../utils/progress';

interface UploadProgress {
  file: File;
  progress: number;
  status: ProgressStatus;
}

interface DownloadProgress {
  file: CloudFile;
  progress: number;
  status: ProgressStatus;
}

interface CloudStorageState {
  // File management
  files: CloudFile[];
  loading: boolean;
  filesLoaded: boolean; // Cache flag
  lastLoaded: number | null; // Timestamp of last load

  // Upload state
  uploading: boolean;
  showUploadModal: boolean;
  uploadProgress: UploadProgress[];

  // Download state
  downloading: boolean;
  showDownloadModal: boolean;
  downloadProgress: DownloadProgress[];

  // Delete confirmation
  deleteConfirm: { show: boolean; file?: CloudFile };
}

interface CloudStorageActions {
  // File management
  setFiles: React.Dispatch<React.SetStateAction<CloudFile[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadFiles: (forceRefresh?: boolean) => Promise<void>;
  refreshFiles: () => Promise<void>;
  shouldLoadFiles: () => boolean;

  // Upload actions
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  setShowUploadModal: React.Dispatch<React.SetStateAction<boolean>>;
  setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgress[]>>;
  startUpload: (files: File[]) => void;
  updateUploadProgress: (index: number, updates: Partial<UploadProgress>) => void;
  finishUpload: () => void;

  // Download actions
  setDownloading: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDownloadModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDownloadProgress: React.Dispatch<React.SetStateAction<DownloadProgress[]>>;
  startDownload: (file: CloudFile) => void;
  updateDownloadProgress: (fileKey: string, updates: Partial<DownloadProgress>) => void;
  finishDownload: () => void;

  // Delete confirmation
  setDeleteConfirm: React.Dispatch<React.SetStateAction<{ show: boolean; file?: CloudFile }>>;
  showDeleteConfirm: (file: CloudFile) => void;
  hideDeleteConfirm: () => void;
}

export const useCloudStorageState = (): CloudStorageState & CloudStorageActions => {
  // File management state
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [lastLoaded, setLastLoaded] = useState<number | null>(null);

  // Cache TTL: 5 minutes
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  // Download state
  const [downloading, setDownloading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([]);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; file?: CloudFile }>({ show: false });

  // Upload helper functions
  const startUpload = useCallback((filesToUpload: File[]) => {
    setUploading(true);
    const progressItems: UploadProgress[] = filesToUpload.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));
    setUploadProgress(progressItems);
    setShowUploadModal(true);
  }, []);

  const updateUploadProgress = useCallback((index: number, updates: Partial<UploadProgress>) => {
    setUploadProgress(prev => updateProgressByIndex(prev, index, updates));
  }, []);

  const finishUpload = useCallback(() => {
    setUploading(false);
  }, []);

  // Download helper functions
  const startDownload = useCallback((file: CloudFile) => {
    setDownloading(true);
    const progressItems: DownloadProgress[] = [{
      file,
      progress: 0,
      status: 'pending'
    }];
    setDownloadProgress(progressItems);
    setShowDownloadModal(true);
  }, []);

  const updateDownloadProgress = useCallback((fileKey: string, updates: Partial<DownloadProgress>) => {
    setDownloadProgress(prev => updateProgressByPredicate(prev, (item) => item.file.key === fileKey, updates));
  }, []);

  const finishDownload = useCallback(() => {
    setDownloading(false);
  }, []);

  // Cache management functions
  const shouldLoadFiles = useCallback(() => {
    if (!filesLoaded) return true; // Never loaded before
    if (!lastLoaded) return true; // No timestamp

    const now = Date.now();
    const timeSinceLastLoad = now - lastLoaded;
    return timeSinceLastLoad > CACHE_TTL; // Cache expired
  }, [filesLoaded, lastLoaded, CACHE_TTL]);

  const loadFiles = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && !shouldLoadFiles()) {
      return; // Use cached data
    }

    setLoading(true);
    try {
      // Import fetchFiles dynamically to avoid circular dependency
      const { fetchFiles } = await import('../services/api');
      const cloudFiles = await fetchFiles();

      // Generate preview URLs for media files
      const filesWithPreviews = await Promise.all(
        cloudFiles.map(async (file) => {
          const { isMediaFile } = await import('../services/api');
          const { generateDownloadUrl } = await import('../services/api');

          if (isMediaFile(file.key)) {
            try {
              const downloadResponse = await generateDownloadUrl(file.key);
              return { ...file, previewUrl: downloadResponse.download_url };
            } catch (error) {
              console.warn(`Failed to generate preview URL for ${file.key}:`, error);
              return file;
            }
          }
          return file;
        })
      );

      setFiles(filesWithPreviews);
      setFilesLoaded(true);
      setLastLoaded(Date.now());
    } catch (error) {
      console.error('Error loading files:', error);
      throw error; // Re-throw to let caller handle
    } finally {
      setLoading(false);
    }
  }, [shouldLoadFiles]);

  const refreshFiles = useCallback(async () => {
    await loadFiles(true); // Force refresh
  }, [loadFiles]);

  // Delete confirmation helpers
  const showDeleteConfirm = useCallback((file: CloudFile) => {
    setDeleteConfirm({ show: true, file });
  }, []);

  const hideDeleteConfirm = useCallback(() => {
    setDeleteConfirm({ show: false });
  }, []);

  return {
    // State values
    files,
    loading,
    filesLoaded,
    lastLoaded,
    uploading,
    showUploadModal,
    uploadProgress,
    downloading,
    showDownloadModal,
    downloadProgress,
    deleteConfirm,

    // Actions
    setFiles,
    setLoading,
    loadFiles,
    refreshFiles,
    shouldLoadFiles,
    setUploading,
    setShowUploadModal,
    setUploadProgress,
    startUpload,
    updateUploadProgress,
    finishUpload,
    setDownloading,
    setShowDownloadModal,
    setDownloadProgress,
    startDownload,
    updateDownloadProgress,
    finishDownload,
    setDeleteConfirm,
    showDeleteConfirm,
    hideDeleteConfirm,
  };
};
