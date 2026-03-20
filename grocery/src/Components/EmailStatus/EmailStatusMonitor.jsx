import { Alert, Box, CircularProgress, Fade, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useEmailStatus } from '../../hooks/useEmailStatus';

const EmailStatusMonitor = ({ 
  jobId, 
  onStatusChange, 
  autoRefresh = true, 
  refreshInterval = 3000 
}) => {
  const { status, loading, error, getEmailStatus, monitorEmailDelivery } = useEmailStatus();
  const [lastCheck, setLastCheck] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (jobId && autoRefresh) {
      startMonitoring();
    }
  }, [jobId, autoRefresh]);

  useEffect(() => {
    if (status && onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  const startMonitoring = async () => {
    if (!jobId || isMonitoring) return;

    setIsMonitoring(true);
    setLastCheck(new Date());

    try {
      await monitorEmailDelivery(jobId);
    } finally {
      setIsMonitoring(false);
    }
  };

  const refreshStatus = async () => {
    if (!jobId) return;

    setLastCheck(new Date());
    await getEmailStatus(jobId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return '📧';
      case 'failed':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '📧';
    }
  };

  const formatTime = (date) => {
    return date ? new Date(date).toLocaleTimeString() : 'Unknown';
  };

  if (!jobId) {
    return (
      <Alert severity="info" variant="outlined">
        No email job ID provided for monitoring.
      </Alert>
    );
  }

  if (loading || isMonitoring) {
    return (
      <Box className="space-y-3">
        <Alert 
          severity="info" 
          variant="outlined"
          icon={false}
          action={
            <CircularProgress size={20} />
          }
        >
          <Box className="flex items-center gap-2">
            <span>📧</span>
            <span>Checking email delivery status...</span>
          </Box>
        </Alert>
        {isMonitoring && (
          <LinearProgress 
            sx={{ mt: 1 }} 
            color="info"
          />
        )}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        variant="outlined"
        action={
          <Box 
            component="button"
            onClick={refreshStatus}
            className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Retry
          </Box>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!status) {
    return (
      <Alert 
        severity="warning" 
        variant="outlined"
        action={
          <Box 
            component="button"
            onClick={refreshStatus}
            className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Check Status
          </Box>
        }
      >
        Email status not found. The job may not exist or may have expired.
      </Alert>
    );
  }

  return (
    <Fade in>
      <Box className="space-y-3">
        <Alert 
          severity={getStatusColor(status.status)} 
          variant="outlined"
          icon={false}
        >
          <Box className="flex items-center justify-between w-full">
            <Box className="flex items-center gap-2">
              <span>{getStatusIcon(status.status)}</span>
              <Box>
                <div className="font-medium">
                  Email Status: {status.status.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">
                  To: {status.to}
                </div>
                <div className="text-sm text-gray-600">
                  Subject: {status.subject}
                </div>
              </Box>
            </Box>
            <Box className="text-right">
              <div className="text-sm text-gray-600">
                Attempts: {status.attemptCount}
              </div>
              <div className="text-xs text-gray-500">
                Last check: {formatTime(lastCheck)}
              </div>
            </Box>
          </Box>
        </Alert>

        {status.lastError && status.status === 'failed' && (
          <Alert severity="error" variant="outlined" className="mt-2">
            <div className="font-medium">Delivery Error:</div>
            <div className="text-sm">{status.lastError}</div>
          </Alert>
        )}

        {status.status === 'pending' && (
          <Alert 
            severity="info" 
            variant="outlined"
            action={
              <Box 
                component="button"
                onClick={refreshStatus}
                className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Refresh
              </Box>
            }
          >
            Email is still being processed. The system will automatically retry failed deliveries.
          </Alert>
        )}

        {autoRefresh && (
          <Box className="text-xs text-gray-500 text-center">
            Auto-refresh enabled. Last check: {formatTime(lastCheck)}
          </Box>
        )}
      </Box>
    </Fade>
  );
};

export default EmailStatusMonitor;