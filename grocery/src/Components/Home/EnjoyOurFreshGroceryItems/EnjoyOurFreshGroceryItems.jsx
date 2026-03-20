import { Button, Container, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import ProductCard, { ProductCardSkeleton } from '../../Products/ProductCard/ProductCard';
import { useNavigate } from 'react-router-dom';

import { useApiError } from '../../../hooks/useApiError';
import ErrorAlert from '../../ErrorAlert/ErrorAlert';
import { getTopItemsByIndex } from '../../../services/productsService';

const EnjoyOurFreshGroceryItems = () => {
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const { errorMessage, hasError, setApiError, clearError } = useApiError();

    const isExtraSmallScreen = useMediaQuery('(max-width: 640px)');

    useEffect(() => {
        let isMounted = true;

        const fetchItems = async () => {
            setIsLoading(true);
            try {
                const topItems = await getTopItemsByIndex(selectedCategory, 3);

                if (!isMounted) {
                    return;
                }

                setItems(Array.isArray(topItems) ? topItems : []);
            } catch (error) {
                if (!isMounted) {
                    return;
                }
                setApiError(error?.message || 'Failed to load grocery items');
                setItems([]);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchItems();

        return () => {
            isMounted = false;
        };
    }, [selectedCategory, setApiError])

    return (
        <Container >
            <ErrorAlert message={errorMessage} open={hasError} onClose={clearError} />
            <div className='space-y-7 xl:space-y-8'>
                {}
                <h1 className='text-center pb-0 md:text-2xl text-xl font-semibold capitalize tracking-wide'>
                    Enjoy Our Healthy And Fresh <br />
                    FreshBasket Items
                </h1>
                {}
                <ItemsToggler
                    alignment={selectedCategory}
                    setAlignment={setSelectedCategory} />

                {}
                <div className='grid md:grid-cols-3 sm:grid-cols-2 
                lg:gap-6 gap-x-5 gap-y-5'>
                    {!isLoading ?
                        items.map(item => (
                            <ProductCard key={item.id}
                                product={item} />
                        ))
                        : Array.from({ length: 3 }).map((pd, i) => {
                            return <ProductCardSkeleton key={i} />
                        })
                    }
                </div>
                <Button
                    onClick={() => navigate('/products')}
                    color='success'
                    size={isExtraSmallScreen ? 'small' : 'medium'}
                    variant='outlined'
                    sx={{ textTransform: 'capitalize', display: 'block', mx: 'auto' }}>
                    View All Products
                </Button>
            </div>
        </Container>
    );
};

const ItemsToggler = ({ alignment, setAlignment }) => {

    const isExtraSmallScreen = useMediaQuery('(max-width: 640px)')
    const isLargeScreen = useMediaQuery('(min-width: 1024px)');

    return (
        <div className='space-x-3 md:space-x-5 text-center'>
            {[
                { id: 0, name: 'Meat' },
                { id: 1, name: 'Vegetables' },
                { id: 2, name: 'Fruits' },
            ].map(category => (
                <Button
                    sx={{ textTransform: 'capitalize', transition: 'all 150ms ease-in-out' }}
                    size={isExtraSmallScreen ? 'small' : isLargeScreen ? 'large' : 'medium'}
                    color='success'
                    variant={alignment === category.id ? 'contained' : 'text'}
                    key={category.id}
                    onClick={(e) => setAlignment(Number.parseInt(e.target.value))}
                    value={category.id}>
                    {category.name}
                </Button>
            ))}
        </div >
    )
}

export default EnjoyOurFreshGroceryItems;