import { createContext, useContext } from 'react';
import OurServicesAndQualities from '../../OurServicesAndQualities/OurServicesAndQualities';
import right from '../../../assets/icons/right_symbol.png';
import { Button, useMediaQuery } from '@mui/material';
import { FreshBasketContext } from '../../Layout/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

export const ourBestQualityContext = createContext();

const OurBestQualities = () => (
    <ourBestQualityContext.Provider value={true}>
        <OurServicesAndQualities>
            <OurQualities />
        </OurServicesAndQualities>
    </ourBestQualityContext.Provider>
);

const OurQualities = () => {

    const { cartItemsState } = useContext(FreshBasketContext);
    const [cartItems, setCartItems] = cartItemsState;
    const navigate = useNavigate()
    const { user } = useAuth();

    const isMediumScreen = useMediaQuery('(max-width: 1024px)');

    const handleOrder = () => {
        cartItems.length > 0 && user ?
            navigate('/cart') : navigate('/products')
    }

    return (
        <div className='lg:space-y-6 sm:space-y-4 space-y-5'>
            {}
            <ul className='md:space-y-4 sm:space-y-2 space-y-2.5'>
                {['Best Quality Healthy And Fresh FreshBasket', '100% Organic & Natural Products', '100% Returns & Refunds', 'User-Friendly Mobile Apps'].map((quality, i) => (
                    <li key={i} className='space-x-2 p-0'>
                        <img className='inline-block lg:h-6 h-4 my-auto'
                            src={right}
                            loading='lazy'
                            alt={quality} />
                        <span className='inline-block lg:text-base md:text-sm sm:text-xs text-sm font-semibold'>{quality}</span>
                    </li>
                ))}
            </ul>

            {}
            <Button
                onClick={handleOrder}
                size={isMediumScreen ? 'medium' : 'large'}
                sx={{ textTransform: 'capitalize' }}
                variant='contained'
                color='success'>
                Order Now
            </Button>
        </div>
    )
}

export default OurBestQualities;