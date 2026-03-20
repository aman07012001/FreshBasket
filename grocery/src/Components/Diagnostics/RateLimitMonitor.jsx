
import React, { useState, useEffect } from 'react';

const RateLimitMonitor = () => {
  const [requests, setRequests] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const [url, options] = args;
      const startTime = Date.now();

      try {
        const response = await originalFetch(...args);

        const rateLimitInfo = {
          limit: response.headers.get('x-ratelimit-limit'),
          remaining: response.headers.get('x-ratelimit-remaining'),
          reset: response.headers.get('x-ratelimit-reset'),
          retryAfter: response.headers.get('retry-after')
        };

        const isRateLimited = response.status === 429;

        setRequests(prev => [...prev, {
          timestamp: new Date().toISOString(),
          url: typeof url === 'string' ? url : url.url,
          method: options?.method || 'GET',
          status: response.status,
          isRateLimited,
          rateLimitInfo,
          duration: Date.now() - startTime
        }]);

        return response;
      } catch (error) {
        setRequests(prev => [...prev, {
          timestamp: new Date().toISOString(),
          url: typeof url === 'string' ? url : url.url,
          method: options?.method || 'GET',
          status: 'ERROR',
          error: error.message,
          duration: Date.now() - startTime
        }]);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isMonitoring]);

  const clearLogs = () => setRequests([]);

  const rateLimitedRequests = requests.filter(r => r.isRateLimited);
  const recentRequests = requests.slice(-20);

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999,
      maxWidth: '400px',
      fontSize: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <strong>Rate Limit Monitor</strong>
        <div>
          <button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            style={{
              background: isMonitoring ? '#28a745' : '#dc3545',
              color: 'white',
              border: 'none',
              padding: '2px 6px',
              borderRadius: '3px',
              marginRight: '5px'
            }}
          >
            {isMonitoring ? 'Stop' : 'Start'}
          </button>
          <button 
            onClick={clearLogs}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '2px 6px',
              borderRadius: '3px'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '5px' }}>
        <div>Total: {requests.length}</div>
        <div style={{ color: '#ffc107' }}>Rate Limited: {rateLimitedRequests.length}</div>
      </div>

      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        {recentRequests.map((req, index) => (
          <div key={index} style={{ 
            marginBottom: '5px', 
            padding: '5px', 
            borderRadius: '3px',
            background: req.isRateLimited ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: req.isRateLimited ? '#ffc107' : '#fff' }}>
                {req.method} {req.status === 429 ? '🚨' : ''}
              </span>
              <span>{req.status}</span>
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {req.url.replace('http://localhost:5002', '')}
            </div>
            {req.isRateLimited && (
              <div style={{ color: '#ffc107', fontSize: '10px' }}>
                Rate Limited! {req.rateLimitInfo.retryAfter ? `Retry after: ${req.rateLimitInfo.retryAfter}s` : ''}
              </div>
            )}
            <div style={{ fontSize: '10px', color: '#ccc' }}>
              {new Date(req.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RateLimitMonitor;