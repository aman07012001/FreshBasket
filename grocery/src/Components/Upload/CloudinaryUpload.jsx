import React, { useRef } from 'react';
import useCloudinaryUpload from '../../hooks/useCloudinaryUpload';
import ErrorAlert from '../ErrorAlert/ErrorAlert';
import UploadProgressIndicator from './UploadProgressIndicator';

const CloudinaryUpload = ({
  onUploadSuccess,
  onUploadError,
  multiple = false,
  accept = "image/*",
  maxSize = 5,
  className = "",
  children,
  disabled = false,
}) => {
  const fileInputRef = useRef(null);
  const {
    uploading,
    progress,
    error,
    uploadSingle,
    uploadMultiple,
    deleteFile,
    clearError,
    reset
  } = useCloudinaryUpload();

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    clearError();

    if (multiple) {
      const result = await uploadMultiple(files);
      if (result) {
        onUploadSuccess?.(result);
      } else {
        onUploadError?.(error);
      }
    } else {
      const result = await uploadSingle(files[0]);
      if (result) {
        onUploadSuccess?.(result);
      } else {
        onUploadError?.(error);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || uploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      clearError();

      return;
    }

    clearError();

    if (multiple) {
      const result = await uploadMultiple(imageFiles);
      if (result) {
        onUploadSuccess?.(result);
      } else {
        onUploadError?.(error);
      }
    } else {
      const result = await uploadSingle(imageFiles[0]);
      if (result) {
        onUploadSuccess?.(result);
      } else {
        onUploadError?.(error);
      }
    }
  };

  const triggerFileInput = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  React.useEffect(() => {
    if (disabled) {
      clearError();
    }
  }, [disabled, clearError]);

  return (
    <div className={`cloudinary-upload ${className}`}>
      {}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
        style={{ display: 'none' }}
      />

      {}
      {error && (
        <ErrorAlert
          message={error}
          onClose={clearError}
          className="mb-4"
        />
      )}

      {}
      <div
        className={`
          upload-area
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500 hover:bg-primary-50'}
          ${uploading ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50'}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {uploading ? (

          <UploadProgressIndicator
            progress={progress}
            uploading={uploading}
            fileName="Uploading file..."
            fileSize={5 * 1024 * 1024} 
            uploadSpeed={Math.round(progress / 2)}
            timeRemaining={progress > 0 && progress < 100 ? Math.max(1, Math.round((100 - progress) * 0.5)) : 0}
            showDetails={true}
          />
        ) : (

          <div className="space-y-4">
            <div className="text-gray-400">
              <svg
                className="w-12 h-12 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {children || (multiple ? 'Choose or drag multiple images' : 'Choose or drag an image')}
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: JPEG, PNG, GIF, WebP (Max {maxSize}MB)
              </p>
            </div>

            <button
              type="button"
              disabled={disabled || uploading}
              className={`
                inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium
                rounded-md text-white transition-colors duration-300
                ${disabled || uploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }
              `}
            >
              Select {multiple ? 'Files' : 'File'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudinaryUpload;
