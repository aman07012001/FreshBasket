import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Button, Container, Fade, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FreshBasketContext } from '../Layout/Layout';
import { useContext } from 'react';
import GoBackButton from '../Cart/GoBackButton/GoBackButton';
import { apiRequest } from '../../utils/api';
import { handleSessionStorage } from '../../utils/utils';
import { orderSchema } from '../../validation/schemas';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItemsState } = useContext(FreshBasketContext);
    const [cartItems, setCartItems] = cartItemsState;
    const [{ isPending }] = usePayPalScriptReducer();

    const [success, setSuccess] = useState(false);
    const [orderID, setOrderID] = useState(null);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    const isPayPalConfigured = paypalClientId && paypalClientId !== 'your_paypal_sandbox_client_id_here';

    const deliveryDetails = handleSessionStorage('get', 'deliveryDetails') || null;

    const subtotal = Number.parseFloat(cartItems.reduce((total, item) => total + Number.parseFloat(item.total), 0));
    const deliveryCharge = 5.99;
    const totalAmount = subtotal + deliveryCharge;

    if (!deliveryDetails) {
        navigate('/cart');
        return null;
    }

    const handleApprove = async (data, actions) => {
        try {
            const details = await actions.order.capture();
            setOrderID(details.id);
            setSuccess(true);

            const items = cartItems.map((item) => ({
                productId: String(item.id ?? item.productId ?? ''),
                name: item.name,
                price: Number.parseFloat(item.price ?? item.unitPrice ?? item.total) || 0,
                quantity: Number.parseInt(item.quantity ?? 1, 10) || 1,
                img: item.img || '',
            }));

            const orderData = {
                items,
                paymentMethod: 'ONLINE',
                totalAmount,
                deliveryAddress: {
                    name: deliveryDetails.name,
                    phone: deliveryDetails.phone,
                    pincode: deliveryDetails.pincode || '',
                    address: deliveryDetails.address,
                    city: deliveryDetails.city || '',
                    state: deliveryDetails.state || '',
                    email: deliveryDetails.email || '',
                },
            };

            try {
                await orderSchema.validate(orderData);
            } catch (validationError) {
                console.error('Order validation error:', validationError);
                setError('Invalid order data. Please check your information.');
                return;
            }

            const backendResult = await apiRequest(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                body: JSON.stringify({
                    orderId: details.id,
                    ...orderData,
                }),
            });

            if (backendResult && backendResult.error) {
                console.error('Order backend error:', backendResult.message);
            }

            setCartItems([]);
            handleSessionStorage('remove', 'cartItems');
            handleSessionStorage('remove', 'deliveryDetails');
            const newOrderId = backendResult && backendResult.order && backendResult.order.orderId
              ? backendResult.order.orderId
              : details.id;
            navigate(`/order-confirmation?orderId=${encodeURIComponent(newOrderId)}`);
        } catch (err) {
            console.error('Order capture error:', err);
            setError('Payment failed. Please try again.');
        }
    };

    const handleMockPayment = async () => {
        setIsProcessing(true);
        setError(null);

        try {

            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockOrderId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            setOrderID(mockOrderId);
            setSuccess(true);

            const items = cartItems.map((item) => ({
                productId: String(item.id ?? item.productId ?? ''),
                name: item.name,
                price: Number.parseFloat(item.price ?? item.unitPrice ?? item.total) || 0,
                quantity: Number.parseInt(item.quantity ?? 1, 10) || 1,
                img: item.img || '',
            }));

            const orderData = {
                items,
                paymentMethod: 'COD',
                totalAmount,
                deliveryAddress: {
                    name: deliveryDetails.name,
                    phone: deliveryDetails.phone,
                    pincode: deliveryDetails.pincode || '',
                    address: deliveryDetails.address,
                    city: deliveryDetails.city || '',
                    state: deliveryDetails.state || '',
                    email: deliveryDetails.email || '',
                },
            };

            try {
                await orderSchema.validate(orderData);
            } catch (validationError) {
                console.error('Order validation error:', validationError);
                setError('Invalid order data. Please check your information.');
                return;
            }

            const backendResult = await apiRequest(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                body: JSON.stringify({
                    orderId: mockOrderId,
                    ...orderData,
                }),
            });

            if (backendResult && backendResult.error) {
                console.error('Order backend error:', backendResult.message);
            }

            setCartItems([]);
            handleSessionStorage('remove', 'cartItems');
            handleSessionStorage('remove', 'deliveryDetails');
            navigate(`/order-confirmation?orderId=${encodeURIComponent(mockOrderId)}`);
        } catch (err) {
            console.error('Mock payment error:', err);
            setError('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F9FFF9] px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-6 relative">
                {}
                <div className="absolute -top-2 -left-2 z-10">
                    <GoBackButton />
                </div>

                {}
                <h1 className='text-xl md:text-2xl font-semibold text-gray-600 text-center'>
                    Complete Payment
                </h1>

                {}
                <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
                    <h3 className='font-medium text-gray-800 text-base md:text-lg'>Order Summary</h3>
                    <div className='space-y-2'>
                        <div className='flex justify-between text-sm md:text-base'>
                            <span>Subtotal ({cartItems.length} items)</span>
                            <span>$ {subtotal.toFixed(2)}</span>
                        </div>
                        <hr className='border-gray-200' />
                        <div className='flex justify-between text-sm md:text-base'>
                            <span>Delivery charge</span>
                            <span>$ {deliveryCharge.toFixed(2)}</span>
                        </div>
                        <hr className='border-gray-200' />
                        <div className='flex justify-between font-bold text-green-600 text-base md:text-lg'>
                            <span>Total</span>
                            <span>$ {totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {}
                {error && (
                    <div className='text-red-500 text-center p-4 bg-red-50 rounded-lg text-sm'>
                        {error}
                    </div>
                )}

                {}
                <Fade in={true}>
                    <div className='space-y-6'>
                        {!success ? (
                            <div className='space-y-4'>
                                {}
                                {isPayPalConfigured && (
                                    <div className='space-y-2'>
                                        <h3 className='text-lg font-medium text-gray-800'>Pay with PayPal</h3>
                                        {isPending ? (
                                            <div className='text-center p-8'>
                                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto'></div>
                                                <p className='mt-2 text-gray-600'>Loading PayPal...</p>
                                            </div>
                                        ) : (
                                            <PayPalButtons
                                                style={{
                                                    layout: 'vertical',
                                                    color: 'gold',
                                                    shape: 'pill',
                                                    label: 'pay',
                                                }}
                                                createOrder={(data, actions) => {
                                                    return actions.order.create({
                                                        purchase_units: [
                                                            {
                                                                amount: {
                                                                    value: totalAmount.toString(),
                                                                },
                                                            },
                                                        ],
                                                    });
                                                }}
                                                onApprove={handleApprove}
                                                onError={(err) => {
                                                    console.error('PayPal error:', err);
                                                    setError('Payment failed. Please try again.');
                                                }}
                                            />
                                        )}
                                    </div>
                                )}

                                {}
                                <div className='space-y-3'>
                                    {!isPayPalConfigured && (
                                        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                                            <p className='text-yellow-800 text-sm'>
                                                <span className='font-semibold'>Note:</span> PayPal is not configured. Using mock payment for testing.
                                                To enable real PayPal payments, update your <code className='bg-yellow-100 px-1 rounded text-xs'>.env</code> file with a valid PayPal Client ID.
                                            </p>
                                        </div>
                                    )}
                                    <div className='space-y-2'>
                                        <h3 className='text-base md:text-lg font-medium text-gray-800'>
                                            {isPayPalConfigured ? 'Or pay with' : 'Test Payment'}
                                        </h3>
                                        {!isPayPalConfigured && (
                                            <p className='text-xs text-gray-500 -mt-1'>(Sandbox Mode)</p>
                                        )}
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={handleMockPayment}
                                            disabled={isProcessing}
                                            sx={{
                                                backgroundColor: '#10B981',
                                                '&:hover': {
                                                    backgroundColor: '#059669',
                                                    transform: 'brightness(1.05)'
                                                },
                                                padding: '14px',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                borderRadius: '8px',
                                                textTransform: 'none',
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        >
                                            {isProcessing ? (
                                                <div className='flex items-center space-x-2'>
                                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                                                    <span>Processing...</span>
                                                </div>
                                            ) : (
                                                `Pay $${totalAmount.toFixed(2)} ${isPayPalConfigured ? '(Test)' : ''}`
                                            )}
                                        </Button>
                                        <p className='text-xs text-gray-400 text-center mt-3'>
                                            {isPayPalConfigured
                                                ? 'This is a test payment button for development'
                                                : 'Mock payment for testing purposes only'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='text-center p-6 bg-green-50 rounded-lg'>
                                <h3 className='text-green-600 text-xl font-semibold mb-2'>
                                    Payment Successful! 🎉
                                </h3>
                                <p className='text-gray-700 mb-4 text-sm md:text-base'>
                                    Your order ID: <span className='font-mono'>{orderID}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </Fade>
            </div>
        </div>
    );
};

export default Checkout;
