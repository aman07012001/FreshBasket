import { useState, useCallback } from 'react';
import { api } from '../utils/api';
import { cloudinaryConfig, validateFile } from '../config/cloudinary';

const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadResults, setUploadResults] = useState([]);

  const validateCloudinaryConfig = useCallback(() => {
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey || !cloudinaryConfig.apiSecret) {
      setError(cloudinaryConfig.errorMessages.noCredentials);
      return false;
    }
    return true;
  }, []);

  const uploadSingle = useCallback(async (file) => {
    if (!file) {
      setError('No file selected');
      return null;
    }

    if (!validateCloudinaryConfig()) {
      return null;
    }

    try {

      const validation = await validateFile(file);
      if (!validation.valid) {
        setError(validation.message);
        return null;
      }

      setUploading(true);
      setProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.upload('/upload/single', formData, (progress) => {
        setProgress(Math.round(progress));
      }, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploading(false);
      setProgress(100);
      setUploadResults([response]);

      return response;
    } catch (err) {
      setUploading(false);
      setProgress(0);

      let errorMessage = cloudinaryConfig.errorMessages.uploadFailed;

      if (err.response) {
        errorMessage = err.response.data?.message || err.message || errorMessage;
      } else if (err.request) {
        errorMessage = cloudinaryConfig.errorMessages.networkError;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      return null;
    }
  }, [validateCloudinaryConfig]);

  const uploadMultiple = useCallback(async (files) => {
    if (!files || files.length === 0) {
      setError('No files selected');
      return null;
    }

    if (!validateCloudinaryConfig()) {
      return null;
    }

    try {

      const validationPromises = Array.from(files).map(file => validateFile(file));
      const validations = await Promise.all(validationPromises);

      const invalidFiles = validations.filter(v => !v.valid);
      if (invalidFiles.length > 0) {
        setError(invalidFiles[0].message);
        return null;
      }

      setUploading(true);
      setProgress(0);
      setError(null);

      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await api.upload('/upload/multiple', formData, (progress) => {
        setProgress(Math.round(progress));
      }, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploading(false);
      setProgress(100);
      setUploadResults(response.data || []);

      return response;
    } catch (err) {
      setUploading(false);
      setProgress(0);

      let errorMessage = cloudinaryConfig.errorMessages.uploadFailed;

      if (err.response) {
        errorMessage = err.response.data?.message || err.message || errorMessage;
      } else if (err.request) {
        errorMessage = cloudinaryConfig.errorMessages.networkError;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      return null;
    }
  }, [validateCloudinaryConfig]);

  const deleteFile = useCallback(async (publicId) => {
    if (!publicId) {
      setError('Public ID is required for deletion');
      return null;
    }

    if (!validateCloudinaryConfig()) {
      return null;
    }

    try {
      const response = await api.delete(`/upload/${publicId}`);
      return response;
    } catch (err) {

      let errorMessage = cloudinaryConfig.errorMessages.deleteFailed;

      if (err.response) {
        errorMessage = err.response.data?.message || err.message || errorMessage;
      } else if (err.request) {
        errorMessage = cloudinaryConfig.errorMessages.networkError;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return null;
    }
  }, [validateCloudinaryConfig]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadResults([]);
  }, []);

  const retryUpload = useCallback(async (file) => {
    clearError();
    if (file) {
      return await uploadSingle(file);
    }
    return null;
  }, [uploadSingle, clearError]);

  const getUploadStats = useCallback(() => {
    return {
      totalFiles: uploadResults.length,
      successfulUploads: uploadResults.filter(result => result && !result.error).length,
      failedUploads: uploadResults.filter(result => result && result.error).length,
      averageUploadTime: uploadResults.reduce((acc, result) => acc + (result.uploadTime || 0), 0) / uploadResults.length || 0,
    };
  }, [uploadResults]);

  return {
    uploading,
    progress,
    error,
    uploadResults,
    uploadSingle,
    uploadMultiple,
    deleteFile,
    clearError,
    reset,
    retryUpload,
    getUploadStats,
  };
};

export default useCloudinaryUpload;
