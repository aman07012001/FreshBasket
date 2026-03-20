import EmptyCart from './EmptyCart/EmptyCart';
import { Container } from "@mui/material";
import { createContext, useContext, useState, useEffect } from "react";

import OrderSummary from "./OrderSummary/OrderSummary";
import CartItems from "./CartItems/CartItems";
import { FreshBasketContext } from "../Layout/Layout";
import DeliveryForm from "./DeliveryForm/DeliveryForm";

export const checkoutContext = createContext();
const Cart = () => {

    useEffect(() => {
        window.scroll({ top: 0 });
    }, []);

    const { cartItemsState } = useContext(FreshBasketContext);
    const [cartItems, setCartItems] = cartItemsState;

    const [isProceedToCheckout, setIsProceedToCheckout] = useState(false);

    return (
        <checkoutContext.Provider value={[isProceedToCheckout, setIsProceedToCheckout]}>
            <section className={`${cartItems.length > 0 ? 'min-h-screen ' : 'h-screen '}pt-20 pb-10`}>
                {cartItems.length > 0 ?
                    <Container sx={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                        <section className="grid lg:gap-x-0 gap-x-5 gap-y-8 w-full xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1">
                            <div className='col xl:col-span-2 lg:col-span-1 md:col-span-1'>
                                {!isProceedToCheckout ?
                                    <CartItems />
                                    : <DeliveryForm/>
                                }
                            </div>
                            <OrderSummary />
                        </section>
                    </Container>

                    : <EmptyCart />
                }
            </section>
        </checkoutContext.Provider>
    );
};

export default Cart;