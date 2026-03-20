import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, Container, Fade, IconButton, InputAdornment, TextField, Alert } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupSchema } from '../../../validation/schemas';
import animation from '../../../assets/animations/loginAnimation.gif';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const Signup = () => {
    const { register: formRegister, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(signupSchema),
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signupError, setSignupError] = useState('');

    const navigate = useNavigate();
    const { register: authRegister, loading } = useAuth();

    const onSubmit = async (data) => {
        setSignupError('');

        const result = await authRegister({
            name: data.name,
            email: data.email,
            password: data.password,
        });

        if (!result.success) {
            setSignupError(result.message || 'Registration failed');
            return;
        }

        setSignupError('');
        navigate('/');
    };

    return (
        <section className='h-screen px-2 flex items-center justify-center sm:px-6 lg:px-8'>
            <Fade in={true}>
                <Container>
                    <div className='grid md:grid-cols-2'>
                        {}
                        <div className='hidden md:flex items-center justify-center'>
                            <img
                                className='lg:max-h-80 max-h-[17rem]'
                                src={animation}
                                alt='signup'
                            />
                        </div>

                        {}
                        <div className='flex md:justify-start justify-center'>
                            <div className='flex items-center max-w-sm sm:max-w-md md:max-w-[26rem] p-4'>
                                <div className='lg:space-y-10 md:space-y-8 space-y-10'>
                                    <h3 className='text-center font-semibold text-gray-800 lg:text-3xl md:text-2xl text-3xl'>
                                        Sign Up
                                    </h3>

                                    <form
                                        onSubmit={handleSubmit(onSubmit)}
                                        className='text-center lg:space-y-7 md:space-y-6 space-y-7'
                                    >
                                        {}
                                        <TextField
                                            {...formRegister('name')}
                                            label='Full Name'
                                            size='small'
                                            error={!!errors.name}
                                            helperText={errors.name ? errors.name.message : ''}
                                            fullWidth
                                            color='success'
                                            variant='outlined'
                                        />

                                        {}
                                        <TextField
                                            {...formRegister('email')}
                                            label='Email'
                                            size='small'
                                            error={!!errors.email}
                                            helperText={errors.email ? errors.email.message : ''}
                                            fullWidth
                                            color='success'
                                            variant='outlined'
                                            autoComplete='username'
                                        />

                                        {}
                                        <TextField
                                            {...formRegister('password')}
                                            label='Password'
                                            type={showPassword ? 'text' : 'password'}
                                            fullWidth
                                            size='small'
                                            autoComplete='new-password'
                                            error={!!errors.password}
                                            helperText={errors.password ? errors.password.message : ''}
                                            color='success'
                                            variant='outlined'
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position='end'>
                                                        <IconButton
                                                            size='small'
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? <VisibilityOff fontSize='inherit' /> : <Visibility fontSize='inherit' />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        {}
                                        <TextField
                                            {...formRegister('confirmPassword')}
                                            label='Confirm Password'
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            fullWidth
                                            size='small'
                                            autoComplete='new-password'
                                            error={!!errors.confirmPassword}
                                            helperText={errors.confirmPassword ? errors.confirmPassword.message : ''}
                                            color='success'
                                            variant='outlined'
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position='end'>
                                                        <IconButton
                                                            size='small'
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? <VisibilityOff fontSize='inherit' /> : <Visibility fontSize='inherit' />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        {}
                                        {signupError && (
                                            <Alert severity="error" variant="outlined" sx={{ mt: 1 }}>
                                                {signupError}
                                            </Alert>
                                        )}

                                        {}
                                        <Button
                                            sx={{ textTransform: 'capitalize' }}
                                            type='submit'
                                            color='success'
                                            variant='contained'
                                            fullWidth
                                            disabled={loading}
                                        >
                                            Sign Up
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </Fade>
        </section>
    );
};

export default Signup;
