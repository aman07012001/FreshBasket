import { Outlet } from "react-router-dom";
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { createContext, useContext, useEffect, useState } from "react";
import { handleSessionStorage } from "../../utils/utils";
import { AuthContext } from "../../context/AuthContext";
import { fetchCart, addToCart } from "../../services/cartService";

console.log('Creating groceryContext and FreshBasketContext');

export const groceryContext = createContext();
export const FreshBasketContext = createContext(); 

const cartItemsFromSessionStorage = handleSessionStorage('get', 'cartItems') || [];

const Layout = () => {
    const [cartItems, setCartItems] = useState(cartItemsFromSessionStorage);
    const { user } = useContext(AuthContext);

    console.log('Layout rendering with FreshBasketContext:', FreshBasketContext);

    useEffect(() => {
        if (!user) return; 

        let cancelled = false;

        async function syncCart() {

            const backendCart = await fetchCart();
            if (cancelled || !backendCart) return;

            const backendIds = new Set(
                backendCart.cartItems.map((i) => String(i.productId))
            );
            const localOnlyItems = cartItems.filter(
                (localItem) => !backendIds.has(String(localItem.id))
            );
            for (const item of localOnlyItems) {
                if (!cancelled) await addToCart(item);
            }

            const mergedCart = localOnlyItems.length > 0
                ? await fetchCart()
                : backendCart;
            if (cancelled || !mergedCart) return;

            const merged = mergedCart.cartItems.map((backendItem) => {
                const localMatch = cartItems.find(
                    (li) => String(li.id) === String(backendItem.productId)
                );
                return localMatch
                    ? { ...localMatch, quantity: backendItem.qty }
                    : {
                          id: backendItem.productId,
                          name: backendItem.name,
                          price: backendItem.price,
                          quantity: backendItem.qty,
                          total: backendItem.price * backendItem.qty,
                      };
            });

            setCartItems(merged);
            handleSessionStorage('set', 'cartItems', merged);
        }

        syncCart();

        return () => { cancelled = true; };

    }, [user]); 

    return (
        <FreshBasketContext.Provider value={{
            cartItemsState: [cartItems, setCartItems]
        }}>
            <Navbar />
            <section className="min-h-screen pt-20">
                <Outlet />
            </section>
            <Footer />
        </FreshBasketContext.Provider>
    );
};

export default Layout;