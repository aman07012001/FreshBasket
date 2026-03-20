import { Alert, Button, CircularProgress, Container, Fade } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

const Sessions = () => {
  const { 
    user, 
    fetchSessions, 
    revokeSession, 
    revokeAllOtherSessions, 
    checkSessionLimits 
  } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [sessionLimits, setSessionLimits] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      const result = await fetchSessions();
      if (!isMounted) return;

      if (!result.success) {
        setError(result.message || 'Failed to load sessions');
        setSessions([]);
      } else {
        setSessions(result.sessions || []);
      }

      const limitsResult = await checkSessionLimits();
      if (limitsResult.success) {
        setSessionLimits(limitsResult);
      }

      setLoading(false);
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [user, fetchSessions, checkSessionLimits]);

  const handleRevoke = async (sessionId) => {
    setActionMessage('');
    const result = await revokeSession(sessionId);
    setActionMessage(result.message || (result.success ? 'Session revoked.' : 'Failed to revoke session'));

    if (result.success) {
      const refreshed = await fetchSessions();
      if (refreshed.success) {
        setSessions(refreshed.sessions || []);
      }

      const limitsResult = await checkSessionLimits();
      if (limitsResult.success) {
        setSessionLimits(limitsResult);
      }
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setActionMessage('');
    const result = await revokeAllOtherSessions();
    setActionMessage(result.message);

    if (result.success) {

      const refreshed = await fetchSessions();
      if (refreshed.success) {
        setSessions(refreshed.sessions || []);
      }

      const limitsResult = await checkSessionLimits();
      if (limitsResult.success) {
        setSessionLimits(limitsResult);
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Sessions</h1>
        <p className="text-gray-600">You need to be logged in to manage your sessions.</p>
      </div>
    );
  }

  return (
    <section className="px-2 py-8 sm:px-6 lg:px-8">
      <Fade in>
        <Container maxWidth="md">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-gray-800">Active Sessions</h1>

            {loading && (
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <CircularProgress size={20} />
                <span>Loading your sessions...</span>
              </div>
            )}

            {!loading && error && (
              <Alert severity="error" variant="outlined">
                {error}
              </Alert>
            )}

            {!loading && !error && sessions.length === 0 && (
              <p className="text-gray-600 text-sm">No active sessions found.</p>
            )}

            {}
            {sessionLimits && (
              <div className={`p-4 rounded-lg border ${sessionLimits.isOverLimit ? 'border-yellow-300 bg-yellow-50' : 'border-green-300 bg-green-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Session Limit: </span>
                    <span>{sessionLimits.activeCount} of {sessionLimits.limit} active sessions</span>
                    {sessionLimits.isOverLimit && (
                      <span className="ml-2 text-yellow-600 font-medium">⚠️ Over limit</span>
                    )}
                  </div>
                  {sessionLimits.activeCount > 1 && (
                    <Button
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                      onClick={handleRevokeAllOtherSessions}
                    >
                      Revoke All Other Sessions
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!loading && !error && sessions.length > 0 && (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>
                        <span className="font-medium">Device:</span> {session.device || 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">IP:</span> {session.ip || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>Created: {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'N/A'}</div>
                        <div>Last used: {session.lastUsedAt ? new Date(session.lastUsedAt).toLocaleString() : 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.revoked ? (
                        <span className="text-xs text-gray-500">Revoked</span>
                      ) : (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                          onClick={() => handleRevoke(session.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {actionMessage && (
              <Alert severity="info" variant="outlined">
                {actionMessage}
              </Alert>
            )}
          </div>
        </Container>
      </Fade>
    </section>
  );
};

export default Sessions;
