import { Alert, Button, CircularProgress, Container, Fade } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import EmailVerificationStatus from './EmailVerificationStatus';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const VerifyEmail = () => {
  const { sendVerifyEmail, user } = useAuth();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    async function verify() {
      if (!uid || !token) {
        setError('Invalid or missing verification link.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ uid, token }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || data.message || 'Failed to verify email');
        }

        setSuccessMessage(data.message || 'Email verified successfully. You can now log in.');
      } catch (err) {

        console.error('verifyEmail error:', err);
        setError(err.message || 'Failed to verify email');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [searchParams]);

  const handleResend = async () => {
    setResendMessage('');
    const result = await sendVerifyEmail();
    setResendMessage(result.message || (result.success ? 'Verification email sent.' : 'Failed to resend verification email'));

    if (result.emailJobId) {
      sessionStorage.setItem('verificationEmailJobId', result.emailJobId);
    }
  };

  return (
    <>
      <section className="h-screen px-2 flex items-center justify-center sm:px-6 lg:px-8">
        <Fade in>
          <Container maxWidth="sm">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6 text-center">
              <h3 className="font-semibold text-gray-800 text-2xl">Verify Email</h3>

              {loading && (
                <div className="flex flex-col items-center gap-3 text-gray-600 text-sm">
                  <CircularProgress size={24} />
                  <span>Verifying your email address...</span>
                </div>
              )}

              {!loading && error && (
                <Alert severity="error" variant="outlined">
                  {error}
                </Alert>
              )}

              {!loading && !error && successMessage && (
                <Alert severity="success" variant="outlined">
                  {successMessage}
                </Alert>
              )}

              {!loading && user && !user.emailVerified && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    If you did not receive the verification email or the link expired, you can request a new one.
                  </p>
                  <Button
                    sx={{ textTransform: 'capitalize' }}
                    type="button"
                    color="success"
                    variant="outlined"
                    onClick={handleResend}
                  >
                    Resend verification email
                  </Button>
                  {resendMessage && (
                    <Alert severity="info" variant="outlined">
                      {resendMessage}
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </Container>
        </Fade>
      </section>

      <EmailVerificationStatus />
    </>
  );
};

export default VerifyEmail;
