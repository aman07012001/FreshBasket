import { Button, useMediaQuery } from '@mui/material';
import { FreshBasketContext } from '../../Layout/Layout';
import { useContext } from 'react';
import { checkoutContext } from '../Cart';

const OrderSummary = () => {

    const { cartItemsState } = useContext(FreshBasketContext);
    const [cartItems, setCartItems] = cartItemsState;
    const [isProceedToCheckout, setIsProceedToCheckout] = useContext(checkoutContext);

    const isMediumScreen = useMediaQuery('(max-width:1024px)');

    const subtotal = Number.parseFloat(cartItems.reduce((total, item) => total + Number.parseFloat(item.total), 0));

    return (
        <div className='flex justify-center md:pt-16 col md:col-span-4 lg:col-span-1'>
            <div className={`lg:space-y-4 sticky top-0 bottom-0 w-full max-w-[25rem] space-y-3`}>
                {}
                <h3 className='lg:text-xl text-lg sm:font-semibold font-bold tracking-wide'>Order Summary</h3>

                {}
                <table className='table-auto h-28 text-sm w-full'>
                    <tbody>
                        {}
                        <tr className='font-medium lg:text-gray-800 text-gray-6000'>
                            <td>Subtotal</td>
                            <td>$ {subtotal.toFixed(2)} USD</td>
                        </tr>
                        {}
                        <tr className='font-medium text-sm lg:text-gray-800 text-gray-600'>
                            <td>Delivery charge</td>
                            <td>$ 5.99 USD</td>
                        </tr>
                        {}
                        <tr className='lg:font-medium font-semibold lg:text-lg'>
                            <td>Total</td>
                            <td style={{ color: 'green' }}>$ {(subtotal + 5.99).toFixed(2)} USD</td>
                        </tr>
                    </tbody>
                </table>

                {}
                <Button
                    fullWidth
                    onClick={() => setIsProceedToCheckout(!isProceedToCheckout)}
                    sx={{ textTransform: 'capitalize', transition: 'display 1000s ease-in-out', display: isProceedToCheckout ? 'none' : 'block' }}
                    variant='contained'
                    size={isMediumScreen ? 'small' : 'medium'}
                    color='success'>
                    Proceed to checkout
                </Button>
            </div>
        </div>
    );
};

export default OrderSummary;