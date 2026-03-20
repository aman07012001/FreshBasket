import { useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import EmailStatusMonitor from '../../EmailStatus/EmailStatusMonitor';

const EmailVerificationStatus = () => {
  const [jobId, setJobId] = useState(null);

  useEffect(() => {

    const storedJobId = sessionStorage.getItem('verificationEmailJobId');
    if (storedJobId) {
      setJobId(storedJobId);

      sessionStorage.removeItem('verificationEmailJobId');
    }
  }, []);

  const handleStatusChange = (status) => {
    if (status.status === 'sent') {

      console.log('Verification email sent successfully');
    } else if (status.status === 'failed') {

      console.error('Verification email failed to send:', status.lastError);
    }
  };

  if (!jobId) {
    return null;
  }

  return (
    <Box className="mt-4">
      <Alert severity="info" variant="outlined" className="mb-4">
        <strong>Email Delivery Status:</strong> We're monitoring the delivery of your email verification.
      </Alert>

      <EmailStatusMonitor 
        jobId={jobId}
        onStatusChange={handleStatusChange}
        autoRefresh={true}
        refreshInterval={3000}
      />
    </Box>
  );
};

export default EmailVerificationStatus;