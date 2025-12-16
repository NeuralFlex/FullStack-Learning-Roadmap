import React, { useEffect, useRef } from 'react';
import type { CloudFile } from '../types';
import {
  generateUploadUrl,
  generateDownloadUrl,
  deleteFileApi,
  uploadFileToS3,
  downloadFileFromS3,
  isMediaFile
} from '../services/api';
import { useToast } from '../hooks/useToast';
import { useCloudStorageState } from '../hooks/useCloudStorageState';
import { formatFileSize } from '../utils';
import { ProgressModal } from './ProgressModal';

interface CloudStorageGalleryProps {
  activeTab: string;
}

export const CloudStorageGallery: React.FC<CloudStorageGalleryProps> = ({ activeTab }) => {
  // Always call hooks first - Rules of Hooks must be respected
  const {
    files,
    loading,
    uploading,
    showUploadModal,
    uploadProgress,
    showDownloadModal,
    downloading,
    downloadProgress,
    deleteConfirm,
    setFiles,
    setShowUploadModal,
    loadFiles,
    startUpload,
    updateUploadProgress,
    finishUpload,
    setShowDownloadModal,
    startDownload,
    updateDownloadProgress,
    finishDownload,
    showDeleteConfirm,
    hideDeleteConfirm,
  } = useCloudStorageState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef<string | null>(null);
  const { addToast } = useToast();

  // Load files only when tab becomes active (not on every render)
  useEffect(() => {
    if (activeTab === 'cloud-storage' && initializedRef.current !== activeTab) {
      initializedRef.current = activeTab;
      loadFiles(); // This will use cached data if available
    }
  }, [activeTab]); // Only depend on activeTab to prevent unnecessary re-runs

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
    startUpload(filesToUpload);

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        // Update status to uploading
        updateUploadProgress(i, { status: 'uploading' });

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
              updateUploadProgress(i, { progress, status: 'uploading' });
            }
          );

          // Mark as completed
          updateUploadProgress(i, { status: 'completed', progress: 100 });
          addToast(`${file.name} uploaded successfully`, 'success');

        } catch (error) {
          // Mark as error
          updateUploadProgress(i, { status: 'error' });
          addToast(`Failed to upload ${file.name}`, 'error');
        }
      }

      // Refresh file list after all uploads are complete
      await loadFiles(true); // Force refresh to get latest data

    } finally {
      finishUpload();
    }
  };

  const handleDownload = async (file: CloudFile) => {
    startDownload(file);

    try {
      // Update status to downloading
      updateDownloadProgress(file.key, { status: 'downloading' });

      const downloadResponse = await generateDownloadUrl(file.key);

      await downloadFileFromS3(
        downloadResponse.download_url,
        file.key?.split('/').pop() || file.key || 'unknown-file',
        (progress) => {
          updateDownloadProgress(file.key || '', { progress, status: 'downloading' });
        }
      );

      // Mark as completed
      updateDownloadProgress(file.key || '', { status: 'completed', progress: 100 });
      addToast(`${file.key?.split('/').pop() || file.key || 'File'} downloaded successfully`, 'success');
    } catch (error) {
      console.error('Error downloading file:', error);
      // Mark as error
      updateDownloadProgress(file.key || '', { status: 'error' });
      addToast(`Failed to download ${file.key?.split('/').pop() || file.key || 'file'}`, 'error');
    } finally {
      finishDownload();
    }
  };

  const handleDelete = (file: CloudFile) => {
    showDeleteConfirm(file);
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
      hideDeleteConfirm();
    }
  };

  // Early return for inactive tabs - in JSX, not before hooks
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
            files.map((file, _index) => {
              const fileKey = file?.key || '';
              const fileName = fileKey.split('/').pop() || fileKey || 'Unknown File';

              return (
                <div key={fileKey || _index} className="file-card">
                  <div className="file-preview">
                    {file?.previewUrl ? (
                      isMediaFile(fileKey) && fileKey.toLowerCase().includes('.mp4') ? (
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
                          alt={fileName}
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
                    <h4 className="file-name" title={fileKey}>
                      {fileName}
                    </h4>
                    <div className="file-details">
                      <span className="file-size">{formatFileSize(file?.size || 0)}</span>
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
              );
            })
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
      {deleteConfirm.show && deleteConfirm.file && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete &#34;{deleteConfirm.file.key?.split('/').pop() || deleteConfirm.file.key || 'this file'}&#34;? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={hideDeleteConfirm}
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
