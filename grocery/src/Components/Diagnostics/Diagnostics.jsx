import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Typography, Alert, Box, Switch, FormControlLabel } from '@mui/material';
import RateLimitMonitor from './RateLimitMonitor';

const Diagnostics = () => {
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const [apiStatus, setApiStatus] = useState(null);
  const [envConfig, setEnvConfig] = useState(null);

  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {

    setEnvConfig({
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      location: window.location.href
    });
  }, []);

  const testApiConnection = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000
      });

      setApiStatus({
        status: response.status,
        ok: response.ok,
        url: `${API_BASE_URL}/health`
      });
    } catch (error) {
      setApiStatus({
        error: error.message,
        url: `${API_BASE_URL}/health`
      });
    }
  };

  const [showRateLimitMonitor, setShowRateLimitMonitor] = useState(false);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        System Diagnostics
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Network Status</Typography>
          <Typography color={networkStatus ? 'success.main' : 'error.main'}>
            {networkStatus ? 'Online' : 'Offline'}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Environment Configuration</Typography>
          {envConfig && (
            <Box>
              <Typography>API Base URL: {envConfig.VITE_API_BASE_URL || 'Not set'}</Typography>
              <Typography>Node Env: {envConfig.NODE_ENV}</Typography>
              <Typography>Current Location: {envConfig.location}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">API Connection Test</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={testApiConnection}
            sx={{ mt: 2 }}
          >
            Test API Connection
          </Button>

          {apiStatus && (
            <Box sx={{ mt: 2 }}>
              {apiStatus.error ? (
                <Alert severity="error">
                  API Connection Failed: {apiStatus.error}
                  <br />
                  URL: {apiStatus.url}
                </Alert>
              ) : (
                <Alert severity={apiStatus.ok ? 'success' : 'warning'}>
                  API Response: {apiStatus.status}
                  <br />
                  URL: {apiStatus.url}
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Common Issues</Typography>
          <ul>
            <li>Backend server not running on port 5000 or 5002</li>
            <li>Environment variables not configured correctly</li>
            <li>Network connectivity issues</li>
            <li>CORS configuration problems</li>
            <li>Rate limiting (429 errors) - Too many requests to auth endpoints</li>
          </ul>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">Rate Limit Monitor</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showRateLimitMonitor}
                onChange={(e) => setShowRateLimitMonitor(e.target.checked)}
              />
            }
            label="Enable real-time rate limit monitoring"
          />
          {showRateLimitMonitor && <RateLimitMonitor />}
        </CardContent>
      </Card>
    </div>
  );
};

export default Diagnostics;