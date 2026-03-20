import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, Container, Fade, IconButton, InputAdornment, TextField, Alert } from '@mui/material';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../../validation/schemas';

import animation from '../../../assets/animations/loginAnimation.gif';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const [showPassword, setShowPassword] = useState(false);
    const [logInError, setLogInError] = useState('');
    const { login, loading } = useAuth();

    window.scroll({ top: 0 });

    const navigate = useNavigate();
    const location = useLocation();
    const { from } = location.state || { from: { pathname: '/' } };

    const onSubmit = async (data) => {
        setLogInError('');
        const result = await login({ email: data.email, password: data.password });

        if (!result.success) {
            setLogInError(result.message || 'Invalid email or password');
            return;
        }

        setLogInError('');
        navigate(from);
    };

    return (
        <section className='h-screen px-2 items-center flex justify-center sm:px-6 lg:px-8'>
            <Fade in={true}>
                <Container>
                    <div className='grid md:grid-cols-2'>
                        {}
                        <div className='col hidden md:flex items-center justify-center'>
                            <img
                                className='lg:max-h-80 max-h-[17rem]'
                                src={animation}
                                alt="login" />
                        </div>
                        {}
                        <div className='flex md:justify-start justify-center'>
                            <div className='flex items-center max-w-sm sm:max-w-md md:max-w-[26rem] p-4 h-80'>
                                <div className='lg:space-y-10 md:space-y-8 space-y-10'>
                                    {}
                                    <h3 className='text-center font-semibold text-gray-800 lg:text-3xl md:text-2xl text-3xl'>
                                        Log In
                                    </h3>
                                    <form onSubmit={handleSubmit(onSubmit)}
                                        className='text-center lg:space-y-7 md:space-y-6 space-y-7' action="login" method="post">
                                        {}
                                        <TextField
                                            {...register('email')}
                                            label='Email'
                                            size='small'
                                            error={errors.email ? true : false}
                                            helperText={errors.email ? errors.email.message : ''}
                                            fullWidth
                                            color='success'
                                            variant='outlined'
                                            autoComplete='email'
                                        />

                                        {}
                                        <TextField
                                            {...register('password')}
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            fullWidth
                                            size="small"
                                            error={errors.password ? true : false}
                                            helperText={errors.password ? errors.password.message : ''}
                                            color="success"
                                            variant="outlined"
                                            autoComplete='current-password'

                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            size='small'
                                                            onClick={() => setShowPassword(!showPassword)}>
                                                            {showPassword ?
                                                                <VisibilityOff fontSize='inherit' />
                                                                : <Visibility fontSize='inherit' />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        {}
                                        {logInError && (
                                            <Alert severity="error" variant="outlined" sx={{ mt: 1 }}>
                                                {logInError}
                                            </Alert>
                                        )}
                                        {}
                                        <Button
                                            sx={{ textTransform: 'capitalize' }}
                                            type='submit'
                                            color='success'
                                            variant='contained'
                                            disabled={loading}
                                        >
                                            Log in
                                        </Button>
                                        <p className="text-sm text-gray-600 mt-3">
                                            Don't have an account? <a href="/signup" className="text-green-600 font-semibold hover:underline">Sign up</a>
                                        </p>

                                        <p className="text-sm text-gray-600 mt-3">
                                            Forgot your password? <a href="/forgot-password" className="text-green-600 font-semibold hover:underline">Reset password</a>
                                        </p>

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

export default Login;