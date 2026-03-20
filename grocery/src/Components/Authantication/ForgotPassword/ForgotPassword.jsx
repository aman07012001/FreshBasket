import { Alert, Button, Container, Fade, TextField } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { forgotPasswordSchema } from '../../../validation/schemas';
import { useAuth } from '../../../hooks/useAuth';
import PasswordResetStatus from './PasswordResetStatus';

const ForgotPassword = () => {
  const { requestPasswordReset, loading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onSubmit = async (values) => {
      setServerError('');
      setSuccessMessage('');

      console.log('🔐 ForgotPassword form submitted with email:', values.email);
      console.log('🔐 Calling requestPasswordReset with:', values.email);

      const result = await requestPasswordReset({ email: values.email });

      console.log('🔐 Password reset request result:', result);

      if (!result.success) {
        console.error('🔐 Password reset request failed:', result.message);
        setServerError(result.message || 'Failed to request password reset');
        return;
      }

      console.log('🔐 Password reset request successful:', result.message);
      setSuccessMessage(result.message || 'If that account exists, you will receive an email shortly.');

      if (result.emailJobId) {
        console.log('🔐 Storing email job ID:', result.emailJobId);
        sessionStorage.setItem('passwordResetJobId', result.emailJobId);
      } else {
        console.log('🔐 No email job ID returned from server');
      }
    };

  return (
    <div>
      <section className="h-screen px-2 flex items-center justify-center sm:px-6 lg:px-8">
        <Fade in>
          <Container maxWidth="sm">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h3 className="text-center font-semibold text-gray-800 text-2xl">Forgot Password</h3>
              <p className="text-sm text-gray-600 text-center">
                Enter your email address and we will send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField
                  {...register('email')}
                  label="Email"
                  size="small"
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : ''}
                  fullWidth
                  color="success"
                  variant="outlined"
                />

                {serverError && (
                  <Alert severity="error" variant="outlined">
                    {serverError}
                  </Alert>
                )}

                {successMessage && (
                  <Alert severity="success" variant="outlined">
                    {successMessage}
                  </Alert>
                )}

                <Button
                  sx={{ textTransform: 'capitalize' }}
                  type="submit"
                  color="success"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  Send reset link
                </Button>
              </form>
            </div>
          </Container>
        </Fade>
      </section>

      {successMessage && <PasswordResetStatus />}
    </div>
  );
};

export default ForgotPassword;
