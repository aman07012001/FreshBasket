import React from 'react';

const UploadProgressIndicator = ({ 
  progress, 
  uploading, 
  fileName, 
  fileSize, 
  uploadSpeed, 
  timeRemaining,
  onCancel,
  showDetails = true 
}) => {

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getProgressColor = () => {
    if (progress < 25) return 'from-red-500 to-red-600';
    if (progress < 50) return 'from-orange-500 to-orange-600';
    if (progress < 75) return 'from-yellow-500 to-yellow-600';
    if (progress < 100) return 'from-green-500 to-green-600';
    return 'from-green-600 to-emerald-600';
  };

  const shimmerClass = uploading && progress < 100 
    ? 'animate-pulse' 
    : 'transition-all duration-500';

  return (
    <div className="upload-progress-indicator space-y-3">
      {}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-gray-700">
            {uploading ? 'Uploading' : progress === 100 ? 'Completed' : 'Upload Progress'}
          </span>
          <span className="text-gray-600">{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full ${shimmerClass} ${
              uploading ? `bg-gradient-to-r ${getProgressColor()}` : 'bg-green-600'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {}
      {fileName && (
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
            {fileSize && (
              <p className="text-xs text-gray-500">{formatBytes(fileSize)}</p>
            )}
          </div>
          {uploading && (
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      )}

      {}
      {showDetails && (
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Speed:</span>
              <span className="font-medium text-gray-700">
                {uploadSpeed ? `${uploadSpeed} KB/s` : 'Calculating...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time left:</span>
              <span className="font-medium text-gray-700">
                {timeRemaining ? formatTime(timeRemaining) : 'Estimating...'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${
                uploading ? 'text-blue-600' : 'text-green-600'
              }`}>
                {uploading ? 'Uploading' : 'Complete'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transferred:</span>
              <span className="font-medium text-gray-700">
                {fileSize ? formatBytes((progress / 100) * fileSize) : '0 Bytes'}
              </span>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${progress >= 20 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className={progress >= 20 ? 'text-green-600 font-medium' : ''}>Start</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${progress >= 50 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className={progress >= 50 ? 'text-green-600 font-medium' : ''}>Half</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${progress >= 80 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className={progress >= 80 ? 'text-green-600 font-medium' : ''}>Almost</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className={progress >= 100 ? 'text-green-600 font-medium' : ''}>Done</span>
        </div>
      </div>

      {}
      {uploading && onCancel && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
          >
            Cancel Upload
          </button>
        </div>
      )}

      {}
      {!uploading && progress === 100 && (
        <div className="flex items-center justify-center space-x-2 text-green-600 text-sm font-medium pt-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Upload completed successfully!</span>
        </div>
      )}
    </div>
  );
};

export default UploadProgressIndicator;