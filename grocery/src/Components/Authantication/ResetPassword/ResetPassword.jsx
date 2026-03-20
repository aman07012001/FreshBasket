import { Alert, Button, Container, Fade, IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordSchema } from '../../../validation/schemas';
import { useAuth } from '../../../hooks/useAuth';

const ResetPassword = () => {
  const { resetPassword, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!uid || !token) {
      setServerError('Invalid or missing password reset link.');
    }
  }, [uid, token]);

  const onSubmit = async (values) => {
    if (!uid || !token) {
      setServerError('Invalid or missing password reset link.');
      return;
    }

    setServerError('');
    setSuccessMessage('');

    const result = await resetPassword({ uid, token, password: values.password });

    if (!result.success) {
      setServerError(result.message || 'Failed to reset password');
      return;
    }

    setSuccessMessage(result.message || 'Password has been reset. You can now log in with your new password.');

    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <section className="h-screen px-2 flex items-center justify-center sm:px-6 lg:px-8">
      <Fade in>
        <Container maxWidth="sm">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h3 className="text-center font-semibold text-gray-800 text-2xl">Reset Password</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <TextField
                {...register('password')}
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                size="small"
                error={!!errors.password}
                helperText={errors.password ? errors.password.message : ''}
                color="success"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff fontSize="inherit" /> : <Visibility fontSize="inherit" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                {...register('confirmPassword')}
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                size="small"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword ? errors.confirmPassword.message : ''}
                color="success"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <VisibilityOff fontSize="inherit" /> : <Visibility fontSize="inherit" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                Reset password
              </Button>
            </form>
          </div>
        </Container>
      </Fade>
    </section>
  );
};

export default ResetPassword;
