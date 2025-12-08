import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CloudFile } from '../types';
import {
  fetchFiles,
  generateUploadUrl,
  generateDownloadUrl,
  deleteFileApi,
  uploadFileToS3,
  downloadFileFromS3,
  isMediaFile
} from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatFileSize } from '../utils';
import { ProgressModal } from './ProgressModal';

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

interface DownloadProgress {
  file: CloudFile;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
}

interface CloudStorageGalleryProps {
  activeTab: string;
}

export const CloudStorageGallery: React.FC<CloudStorageGalleryProps> = ({ activeTab }) => {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; file?: CloudFile }>({ show: false });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const cloudFiles = await fetchFiles();

      // Generate preview URLs for media files
      const filesWithPreviews = await Promise.all(
        cloudFiles.map(async (file) => {
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
    } catch (error) {
      console.error('Error loading files:', error);
      addToast('Failed to load files from cloud storage', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, setFiles]);

  // Load files on component mount and when activeTab changes to cloud-storage
  useEffect(() => {
    if (activeTab === 'cloud-storage') {
      loadFiles();
    }
  }, [activeTab, loadFiles]);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      uploadFiles(selectedFiles);
    }
    e.target.value = ''; // Reset input
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    setUploading(true);

    const progressItems: UploadProgress[] = filesToUpload.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));
    setUploadProgress(progressItems);
    setShowUploadModal(true);

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        // Update status to uploading
        setUploadProgress(prev => prev.map((item, index) =>
          index === i ? { ...item, status: 'uploading' } : item
        ));

        try {
          // Generate upload URL
          const uploadResponse = await generateUploadUrl({
            filename: file.name,
            contentType: file.type
          });



          // Upload to S3
          await uploadFileToS3(
            file,
            uploadResponse.upload_url,
            (progress) => {
              setUploadProgress(prev => prev.map((item, index) =>
                index === i ? { ...item, progress, status: 'uploading' } : item
              ));
            }
          );

          // Mark as completed
          setUploadProgress(prev => prev.map((item, index) =>
            index === i ? { ...item, status: 'completed', progress: 100 } : item
          ));

          addToast(`${file.name} uploaded successfully`, 'success');

        } catch (error) {
          // Mark as error
          setUploadProgress(prev => prev.map((item, index) =>
            index === i ? { ...item, status: 'error' } : item
          ));
          addToast(`Failed to upload ${file.name}`, 'error');
        }
      }

      // Refresh file list after all uploads are complete
      await loadFiles();

    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: CloudFile) => {
    setDownloading(true);

    const progressItems: DownloadProgress[] = [{
      file,
      progress: 0,
      status: 'pending'
    }];
    setDownloadProgress(progressItems);
    setShowDownloadModal(true);

    try {
      // Update status to downloading
      setDownloadProgress(prev => prev.map((item) =>
        item.file.key === file.key ? { ...item, status: 'downloading' } : item
      ));

      const downloadResponse = await generateDownloadUrl(file.key);

      await downloadFileFromS3(
        downloadResponse.download_url,
        file.key.split('/').pop() || file.key,
        (progress) => {
          setDownloadProgress(prev => prev.map((item) =>
            item.file.key === file.key ? { ...item, progress, status: 'downloading' } : item
          ));
        }
      );

      // Mark as completed
      setDownloadProgress(prev => prev.map((item) =>
        item.file.key === file.key ? { ...item, status: 'completed', progress: 100 } : item
      ));

      addToast(`${file.key} downloaded successfully`, 'success');
    } catch (error) {
      console.error('Error downloading file:', error);
      // Mark as error
      setDownloadProgress(prev => prev.map((item) =>
        item.file.key === file.key ? { ...item, status: 'error' } : item
      ));
      addToast(`Failed to download ${file.key}`, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = (file: CloudFile) => {
    setDeleteConfirm({ show: true, file });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.file) return;

    const file = deleteConfirm.file;
    try {
      await deleteFileApi(file.key);
      setFiles(prev => prev.filter(f => f.key !== file.key));
      addToast(`${file.key} deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting file:', error);
      addToast(`Failed to delete ${file.key}`, 'error');
    } finally {
      setDeleteConfirm({ show: false });
    }
  };



  if (activeTab !== 'cloud-storage') return null;

  return (
    <div className="cloud-storage-gallery">
      <div className="flex justify-between items-center mb-6">
        <div className="section-header">
          <h2 className="section-title">Cloud Storage Gallery</h2>
          <p className="section-subtitle">Manage your media files stored in the cloud</p>
        </div>
        <button
          onClick={handleFileSelect}
          disabled={uploading}
          className="upload-button primary"
        >
          📤 Upload Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          accept="image/*,video/*,*/*"
        />
      </div>

      {/* File Grid */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading files...</p>
        </div>
      ) : (
        <div className="files-grid">
          {files.length === 0 ? (
            <div className="empty-state">
              <p>No files found in cloud storage.</p>
              <p>Upload some files to get started.</p>
            </div>
          ) : (
            files.map((file, _index) => (
              <div key={file.key} className="file-card">
                <div className="file-preview">
                  {file.previewUrl ? (
                    isMediaFile(file.key) && file.key.toLowerCase().includes('.mp4') ? (
                      // Video preview
                      <video
                        src={file.previewUrl}
                        controls={false}
                        className="w-full h-32 object-cover rounded-md"
                        onLoadedData={(e) => {
                          e.currentTarget.currentTime = 0.5; // Show thumbnail
                        }}
                      />
                    ) : (
                      // Image preview
                      <img
                        src={file.previewUrl}
                        alt={file.key}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )
                  ) : (
                    // File icon for non-media files
                    <div className="file-icon">
                      📄
                    </div>
                  )}
                </div>

                <div className="file-info">
                  <h4 className="file-name" title={file.key}>
                    {file.key.split('/').pop() || file.key}
                  </h4>
                  <div className="file-details">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                </div>

                <div className="file-actions">
                  <button
                    onClick={() => handleDownload(file)}
                    className="action-button download"
                    title="Download"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className="action-button delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Upload Modal */}
      <ProgressModal
        isOpen={showUploadModal}
        title="Uploading Files"
        progressItems={uploadProgress}
        onClose={() => setShowUploadModal(false)}
        isCompleting={uploading}
      />

      {/* Download Modal */}
      <ProgressModal
        isOpen={showDownloadModal}
        title="Downloading Files"
        progressItems={downloadProgress}
        onClose={() => setShowDownloadModal(false)}
        isCompleting={downloading}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete &#34;{deleteConfirm.file?.key.split('/').pop()}&#34;? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteConfirm({ show: false })}
                className="secondary-button"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="danger-button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
