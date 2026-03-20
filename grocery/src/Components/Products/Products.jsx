import { Container, Fade, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ProductCard, { ProductCardSkeleton } from './ProductCard/ProductCard';
import { useParams } from 'react-router-dom';
import { useApiError } from '../../hooks/useApiError';
import ErrorAlert from '../ErrorAlert/ErrorAlert';
import { useSearch } from '../../hooks/useSearch';
import LoadingWrapper from '../LoadingWrapper/LoadingWrapper';
import { getFlattenedProductsWithCategory, getProductsByCategoryKey } from '../../services/productsService';

const Products = ({ categoryProducts }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { categoryName } = useParams();

    const { errorMessage, hasError, setApiError, clearError } = useApiError();

    const { query, setQuery, results } = useSearch(products, { keys: ['name', 'category'] });
    const hasNoResults = !isLoading && results.length === 0 && query.trim();

    window.scroll({ top: 0 });

    useEffect(() => {
        let isMounted = true;

        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                let data;
                if (categoryName) {
                    data = await getProductsByCategoryKey(categoryName);
                } else {
                    data = await getFlattenedProductsWithCategory();
                }

                if (!isMounted) {
                    return;
                }

                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                if (!isMounted) {
                    return;
                }
                setApiError(error?.message || 'Failed to load products');
                setProducts([]);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
        };
    }, [categoryName, setApiError]);

    return (
        <main className='min-h-screen space-y-5 pt-20 mb-9'>
            <ErrorAlert message={errorMessage} open={hasError} onClose={clearError} />
            <Fade in={true}>
                <Container className='xl:space-y-10 sm:space-y-8 space-y-6'>

                    {}
                    <h1 className='pb-0 md:text-2xl text-xl font-semibold text-gray-700 capitalize'>
                        {categoryName ? categoryName : 'All Products'}
                    </h1>

                    {}
                    <div className='w-full md:max-w-md'>
                        <TextField
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder='Search by product name or category'
                            size='small'
                            fullWidth
                            variant='outlined'
                            color='success'
                        />
                    </div>

                    {}
                    <section className='grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 
                lg:gap-6 gap-x-5 gap-y-5'>
                        <LoadingWrapper
                            loading={isLoading}
                            skeleton={Array.from({ length: 8 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        >
                            {hasNoResults ? (
                                <div className='col-span-full text-center text-sm text-gray-500 py-6'>
                                    No products found. Try a different name or category.
                                </div>
                            ) : (
                                results.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))
                            )}
                        </LoadingWrapper>
                    </section>
                </Container>
            </Fade>

        </main>
    );
};

export default Products;