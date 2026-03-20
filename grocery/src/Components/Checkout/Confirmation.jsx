import { Button, Fade } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Confirmation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('orderId');

    const handleContinueShopping = () => {
        navigate('/');
    };

    return (
        <section className='min-h-screen flex items-center justify-center px-4'>
            <Fade in={true}>
                <div className='max-w-md w-full text-center space-y-6'>
                    {}
                    <div className='flex justify-center'>
                        <CheckCircle
                            sx={{ fontSize: 80, color: 'success.main' }}
                        />
                    </div>

                    {}
                    <h1 className='text-2xl font-bold text-gray-800'>
                        Order Confirmed!
                    </h1>

                    {}
                    <p className='text-gray-600 leading-relaxed'>
                        Thank you for your order. Your payment has been processed successfully.
                        You will receive a confirmation email shortly with your order details.
                    </p>

                    {}
                    <div className='bg-gray-50 p-4 rounded-lg text-left'>
                        <h3 className='font-medium text-gray-800 mb-2'>Order Summary</h3>
                        <div className='text-sm text-gray-600 space-y-1'>
                            <div className='flex justify-between'>
                                <span>Order ID:</span>
                                <span className='font-mono'>
                                    {orderId || 'Unavailable'}
                                </span>
                            </div>
                            <div className='flex justify-between'>
                                <span>Status:</span>
                                <span className='text-green-600 font-medium'>Paid</span>
                            </div>
                            <div className='flex justify-between'>
                                <span>Estimated Delivery:</span>
                                <span>2-3 business days</span>
                            </div>
                        </div>
                    </div>

                    {}
                    <Button
                        onClick={handleContinueShopping}
                        variant='contained'
                        color='success'
                        size='large'
                        sx={{ textTransform: 'capitalize', px: 4 }}
                        fullWidth
                    >
                        Continue Shopping
                    </Button>

                    {}
                    <p className='text-xs text-gray-500'>
                        Need help? Contact our support team at support@freshbasket.com
                    </p>
                </div>
            </Fade>
        </section>
    );
};

export default Confirmation;
