import React from 'react';
import { formatFileSize } from '../utils';

interface ProgressItem {
  file: { name?: string; key?: string; size: number };
  progress: number;
  status: 'pending' | 'uploading' | 'downloading' | 'completed' | 'error';
}

interface ProgressModalProps {
  isOpen: boolean;
  title: string;
  progressItems: ProgressItem[];
  onClose: () => void;
  isCompleting: boolean;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  title,
  progressItems,
  onClose,
  isCompleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            onClick={onClose}
            className="close-button"
          >
            ✕
          </button>
        </div>

        <div className="upload-progress">
          {progressItems.map((item, index) => (
            <div key={index} className="upload-item">
              <div className="upload-info">
                <span className="file-name">{item.file.name || (item.file.key?.split('/').pop() || item.file.key)}</span>
                <span className="file-size">({formatFileSize(item.file.size)})</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill status-${item.status}`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <div className="upload-status">
                {item.status === 'pending' && <span className="status-pending">Pending...</span>}
                {(item.status === 'uploading' || item.status === 'downloading') && <span className="status-uploading">{item.progress}%</span>}
                {item.status === 'completed' && <span className="status-completed">✓ Done</span>}
                {item.status === 'error' && <span className="status-error">✗ Failed</span>}
              </div>
            </div>
          ))}
        </div>

        {!isCompleting && (
          <div className="modal-actions">
            <button
              onClick={onClose}
              className="primary-button"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
