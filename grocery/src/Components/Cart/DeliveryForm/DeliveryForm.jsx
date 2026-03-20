import { Button, Fade, TextField } from '@mui/material';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { deliverySchema } from '../../../validation/schemas';
import { FreshBasketContext } from '../../Layout/Layout';
import { useContext } from 'react';
import GoBackButton from '../GoBackButton/GoBackButton';
import { handleSessionStorage } from '../../../utils/utils';
import { useNavigate } from 'react-router-dom';

const DeliveryForm = () => {
    const { cartItemsState } = useContext(FreshBasketContext);
    const [cartItems, setCartItems] = cartItemsState;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(deliverySchema),
        defaultValues: {
            name: 'John Doe',
            email: 'john@gmail.com',
            phone: '',
            address: '456 Street, fake town, New York',
            pincode: '',
            city: '',
            state: '',
        }
    });

    const navigate = useNavigate()

    const onSubmit = (data) => {
        const normalized = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            pincode: data.pincode,
            city: data.city,
            state: data.state,
        };

        handleSessionStorage('set', 'deliveryDetails', normalized);

        navigate('/checkout');
    }

    return (
        <div className='md:mx-0 mx-auto space-y-4 max-w-[37rem]'>
                {}
                <GoBackButton />
                <div className='space-y-9 lg:space-y-10 '>
                    {}
                    <h1 className='lg:text-2xl text-xl font-semibold text-gray-600'>
                        Complete Delivery Details
                    </h1>

                    {}
                    <Fade in={true}>
                        <form action="post"
                            className='lg:space-y-8  space-y-7'
                            onSubmit={handleSubmit(onSubmit)} >
                            {}
                            <TextField
                                {...register('name')}
                                label='Full Name'
                                size='small'
                                error={errors.name ? true : false}
                                helperText={errors.name ? errors.name.message : ''}
                                fullWidth
                                color='success'
                                variant='outlined' />

                            {}
                            <TextField
                                {...register('email')}
                                label='Email'
                                size='small'
                                error={errors.email ? true : false}
                                helperText={errors.email ? errors.email.message : ''}
                                fullWidth
                                color='success'
                                variant='outlined' />

                            {}
                            <TextField
                                {...register('phone')}
                                label='Phone Number'
                                size='small'
                                error={errors.phone ? true : false}
                                helperText={errors.phone ? errors.phone.message : ''}
                                fullWidth
                                placeholder='Enter at least 10 digits'
                                color='success'
                                variant='outlined' />

                            {}
                            <TextField
                                {...register('address')}
                                label='Address'
                                size='small'
                                error={errors.address ? true : false}
                                helperText={errors.address ? errors.address.message : ''}
                                fullWidth
                                placeholder='street, city, state'
                                color='success'
                                variant='outlined' />

                            {}
                            <TextField
                                {...register('pincode')}
                                label='Pincode'
                                size='small'
                                error={errors.pincode ? true : false}
                                helperText={errors.pincode ? errors.pincode.message : ''}
                                fullWidth
                                color='success'
                                variant='outlined' />

                            {}
                            <TextField
                                {...register('city')}
                                label='City'
                                size='small'
                                error={errors.city ? true : false}
                                helperText={errors.city ? errors.city.message : ''}
                                fullWidth
                                color='success'
                                variant='outlined' />

                            {}
                            <TextField
                                {...register('state')}
                                label='State'
                                size='small'
                                error={errors.state ? true : false}
                                helperText={errors.state ? errors.state.message : ''}
                                fullWidth
                                color='success'
                                variant='outlined' />

                            {}
                            <Button type='submit'
                                fullWidth
                                variant='contained'
                                sx={{ textTransform: 'capitalize' }}
                                color='success'>
                                Place Order
                            </Button>
                        </form>
                    </Fade>
                </div>
        </div>
    );
};

export default DeliveryForm;
