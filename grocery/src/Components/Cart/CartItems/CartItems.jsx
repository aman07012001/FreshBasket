import React, { useContext } from 'react';
import CartItemCard from '../CartItemCard/CartItemCard';
import { FreshBasketContext } from '../../Layout/Layout';

const CartItems = () => {

    const { cartItemsState } = useContext(FreshBasketContext);
    const [cartItems, setCartItems] = cartItemsState;

    return (
        <div className='lg:space-y-10 space-y-5'>
            {}
            <h2 className='lg:text-2xl sm:text-xl text-lg sm:font-semibold font-bold '>
                Selected Items
            </h2>

            {}
            <div className='space-y-3'>
                {cartItems.map(cartItem => (
                    <CartItemCard
                        item={cartItem}
                        key={cartItem.id} />
                ))}

            </div>
        </div>
    );
};

export default CartItems;