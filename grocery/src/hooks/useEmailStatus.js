import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useEmailStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEmailStatus = async (jobId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest(`${API_BASE_URL}/api/email/status/${jobId}`);

      if (result.error) {
        setError(result.message);
        return { success: false, message: result.message };
      }

      setStatus(result.data);
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to get email status';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getUserEmailHistory = async (page = 1, limit = 10, status = null) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        queryParams.append('status', status);
      }

      const result = await apiRequest(`${API_BASE_URL}/api/email/status/user?${queryParams}`);

      if (result.error) {
        setError(result.message);
        return { success: false, message: result.message };
      }

      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to get email history';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const monitorEmailDelivery = async (jobId, maxAttempts = 30, interval = 2000) => {
    setLoading(true);
    setError(null);
    setStatus(null);

    let attempts = 0;

    const checkStatus = async () => {
      attempts++;

      const result = await getEmailStatus(jobId);

      if (result.success && (result.data.status === 'sent' || result.data.status === 'failed')) {
        setLoading(false);
        return result.data;
      }

      if (attempts >= maxAttempts) {
        setLoading(false);
        setError('Email delivery check timed out');
        return null;
      }

      setTimeout(checkStatus, interval);
      return null;
    };

    return checkStatus();
  };

  const clearStatus = () => {
    setStatus(null);
    setError(null);
  };

  return {
    status,
    loading,
    error,
    getEmailStatus,
    getUserEmailHistory,
    monitorEmailDelivery,
    clearStatus,
  };
};