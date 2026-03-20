import { Alert, Box, Button, Fade, LinearProgress, Pagination } from '@mui/material';
import { useState } from 'react';
import { useEmailStatus } from '../../hooks/useEmailStatus';

const EmailHistory = ({ userId, limit = 10 }) => {
  const { getUserEmailHistory, loading, error } = useEmailStatus();
  const [emailLogs, setEmailLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1
  });
  const [statusFilter, setStatusFilter] = useState('');

  const loadEmailHistory = async (page = 1) => {
    const result = await getUserEmailHistory(page, limit, statusFilter);

    if (result.success) {
      setEmailLogs(result.data.logs);
      setPagination(result.data.pagination);
    }
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
        return '✅';
      case 'failed':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '📧';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const handlePageChange = (event, newPage) => {
    loadEmailHistory(newPage);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    loadEmailHistory(1);
  };

  const clearFilter = () => {
    setStatusFilter('');
    loadEmailHistory(1);
  };

  return (
    <Box className="space-y-4">
      <Box className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === '' ? 'contained' : 'outlined'}
          size="small"
          onClick={clearFilter}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleStatusFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === 'sent' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleStatusFilter('sent')}
        >
          Sent
        </Button>
        <Button
          variant={statusFilter === 'failed' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleStatusFilter('failed')}
        >
          Failed
        </Button>
      </Box>

      {loading && (
        <LinearProgress color="info" />
      )}

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      {!loading && emailLogs.length === 0 && (
        <Alert severity="info" variant="outlined">
          No email history found.
        </Alert>
      )}

      {!loading && emailLogs.length > 0 && (
        <Box className="space-y-2">
          {emailLogs.map((log) => (
            <Fade in key={log.id}>
              <Alert 
                severity={getStatusColor(log.status)} 
                variant="outlined"
                icon={false}
              >
                <Box className="flex items-center justify-between w-full">
                  <Box className="flex items-center gap-3">
                    <span className="text-lg">{getStatusIcon(log.status)}</span>
                    <Box>
                      <div className="font-medium">{log.subject}</div>
                      <div className="text-sm text-gray-600">To: {log.to}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(log.createdAt)}
                      </div>
                    </Box>
                  </Box>
                  <Box className="text-right">
                    <div className="text-sm font-medium">
                      {log.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Attempts: {log.attemptCount}
                    </div>
                  </Box>
                </Box>
                {log.lastError && log.status === 'failed' && (
                  <Box className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <div className="text-sm text-red-700 font-medium">Error:</div>
                    <div className="text-sm text-red-600">{log.lastError}</div>
                  </Box>
                )}
              </Alert>
            </Fade>
          ))}
        </Box>
      )}

      {pagination.pages > 1 && (
        <Box className="flex justify-center mt-4">
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default EmailHistory;