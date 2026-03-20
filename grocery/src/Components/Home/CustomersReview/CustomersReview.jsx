import { useEffect, useState } from 'react';
import ReviewCard, { ReviewCardSkeleton } from './ReviewCard/ReviewCard';
import { Container } from '@mui/material';
import { apiRequest } from '../../../utils/api';
import { useApiError } from '../../../hooks/useApiError';
import ErrorAlert from '../../ErrorAlert/ErrorAlert';

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Pagination, Autoplay, FreeMode } from "swiper";
import "swiper/css";

SwiperCore.use([Pagination, Autoplay]);

const CustomersReview = () => {
    const [users, setUsers] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { errorMessage, hasError, setApiError, clearError } = useApiError();

    useEffect(() => {
        let isMounted = true;

        const getUsers = async () => {
            const result = await apiRequest('https://randomuser.me/api/?results=9', {
                credentials: 'omit',
            });

            if (!isMounted) {
                return;
            }

            if (result && result.error) {
                setApiError(result);
                setIsLoaded(false);
                return;
            }

            if (result && result.results) {
                setUsers(result.results);
                setIsLoaded(true);
            } else {
                setUsers([]);
                setIsLoaded(false);
            }
        };

        getUsers();

        return () => {
            isMounted = false;
        };
    }, [setApiError])

    return (
        <Container>
            <ErrorAlert message={errorMessage} open={hasError} onClose={clearError} />
            <section className='sm:space-y-10 space-y-8'>

                {}
                <h1 className='pb-0 md:text-2xl tracking-wide text-xl font-semibold capitalize'>
                    What people say
                </h1>

                {}
                <Swiper style={{ minHeight: '14rem' }}
                    loop={true}
                    centeredSlides={true}
                    breakpoints={
                        {

                            0: {
                                slidesPerView: 1,
                            },

                            640: {
                                slidesPerView: 2,
                                spaceBetween: 30
                            },

                            1060: {
                                slidesPerView: 3,
                                spaceBetween: 30
                            }
                        }
                    }
                    autoplay={{ delay: 1000, disableOnInteraction: false }}
                    speed={700}
                    modules={[Pagination, Autoplay, FreeMode]}
                    freeMode={true}
                    className="mySwiper">
                    {
                        isLoaded ? users.map((user, i) => (
                            <SwiperSlide key={i}>
                                <ReviewCard user={user} />
                            </SwiperSlide>
                        ))

                            : [...Array(9)].map((user, i) => (
                                <SwiperSlide key={i}>
                                    <ReviewCardSkeleton />
                                </SwiperSlide>))
                    }
                </Swiper>
            </section>
        </Container >
    );
};

export default CustomersReview