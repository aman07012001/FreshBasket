import { Button, Card, CardActions, CardContent, CardMedia, Fade, Rating, Skeleton, useMediaQuery } from '@mui/material';
import { Star } from '@mui/icons-material';
import { useContext, useState } from 'react';
import { FreshBasketContext } from '../../Layout/Layout';
import { handleSessionStorage } from '../../../utils/utils';
import SuccessAlert from '../../SuccessAlert/SuccessAlert';
import { optimizeImage, getFallbackImage } from '../../../utils/image';
import StarRating from '../../Reviews/StarRating';

const ProductCard = ({ product }) => {
    const { img, name, price, reviews, reviewCount, quantity, unit } = product;
    const optimizedImg = optimizeImage(img);

    const isMediumScreen = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
    const isSmallScreen = useMediaQuery('(max-width:768px)');

    const [openAlert, setOpenAlert] = useState(false)
    const { cartItemsState } = useContext(FreshBasketContext);
    const [cartItems, setCartItems] = cartItemsState;

    const handleAddToCartBtn = () => {
        let targetedProduct = product;
        let latestCartItems = cartItems;

        const isTargetedProductAlreadyExist = cartItems.find(item => item.id === product.id)
        if (isTargetedProductAlreadyExist) {
            targetedProduct = {
                ...isTargetedProductAlreadyExist,
                quantity: isTargetedProductAlreadyExist.quantity + 1,
                total: ((isTargetedProductAlreadyExist.quantity + 1) * isTargetedProductAlreadyExist.price).toFixed(2)
            }
            latestCartItems = cartItems.filter(item => item.id !== targetedProduct.id)
        }
        setCartItems([
            targetedProduct,
            ...latestCartItems
        ])
        handleSessionStorage('set', 'cartItems', [
            targetedProduct,
            ...latestCartItems
        ])

        setOpenAlert(!openAlert)
    }

    return (
        <div>
            <SuccessAlert
                state={[openAlert, setOpenAlert]}
                massage={'Item added successfully'} />

            <Fade in={true}>
                <Card sx={{ maxWidth: isSmallScreen ? 275 : 295, mx: 'auto', boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white', position: 'relative' }}>

                    {}
                    {}
                    <div className='md:h-36 py-3 w-full bg-white flex items-center justify-center'>
                        <img
                            className='md:max-h-28 max-h-24 w-full object-cover'
                            loading='lazy'
                            src={optimizedImg}
                            alt={name}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getFallbackImage();
                            }}
                        />
                    </div>

                    <div className='p-1.5'>
                        <CardContent className='md:space-y-2 space-y-1.5 '>
                            {}
                            <h3 className='md:text-xl lg:text-2xl text-xl text-gray-700 font-semibold text-center capitalize'>
                                {name}
                            </h3>
                            <div className='md:space-y-1.5 space-y-2 lg:space-y-2'>
                                <div className='flex justify-center space-x-5'>
                                    {}
                                    <span className='block text-sm md:text-xs lg:text-sm'>
                                        ± {quantity} {unit}
                                    </span>
                                    {}
                                    <span className='block text-sm md:text-xs lg:text-sm'>
                                        $ {price} USD
                                    </span>
                                </div>

                                <div className='flex justify-center'>
                                    <div className='flex items-center space-x-1'>
                                        {}
                                        <StarRating
                                            rating={reviews}
                                            size='small'
                                            interactive={false}
                                        />

                                        {}
                                        <span className='text-sm md:text-xs lg:text-sm text-gray-500'>
                                            ( {reviewCount} Reviews )
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardActions>
                            <Button
                                sx={{ textTransform: 'capitalize', marginX: 'auto', ":hover": { bgcolor: '#2e7d32', color: 'white', transition: 'all 235ms ease-in-out' } }}
                                fullWidth
                                onClick={handleAddToCartBtn}
                                size={isMediumScreen ? 'small' : 'medium'}
                                variant='outlined'
                                color='success'>
                                Add to cart
                            </Button>
                        </CardActions>
                    </div>
                </Card>
            </Fade>
        </div>
    );
};

export const ProductCardSkeleton = () => (
    <div>
        <Card sx={{ maxWidth: 308, mx: 'auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }}>

            {}
            <Skeleton
                variant='rectangular'
                height={170}
                width={'100%'} />

            <div className='px-1.5 pb-2'>
                <CardContent className='space-y-2' sx={{ pb: 1 }}>
                    {}
                    <Skeleton
                        sx={{ mx: 'auto' }}
                        variant='text'
                        height={'3rem'}
                        width={'55%'} />

                    <div className='md:space-y-1.5 space-y-2 lg:space-y-2'>
                        <div className='flex justify-center space-x-5'>
                            {}
                            <Skeleton
                                variant='text'
                                height={'1.3rem'}
                                width={'30%'} />

                            {}
                            <Skeleton
                                variant='text'
                                height={'1.3rem'}
                                width={'25%'} />
                        </div>

                        <div className='flex justify-center'>
                            {}
                            <Skeleton
                                variant='text'
                                height={'1.6rem'}
                                width={'80%'} />
                        </div>
                    </div>
                </CardContent>

                {}
                <CardActions sx={{ pt: 0 }}>
                    <Skeleton
                        variant='rounded'
                        height={'1.9rem'}
                        width={'100%'} />
                </CardActions>
            </div>
        </Card>
    </div>
)
export default ProductCard;