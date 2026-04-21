import { Outlet } from "react-router-dom";
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { handleSessionStorage } from "../../utils/utils";
import { AuthContext } from "../../context/AuthContext";
import { fetchCart, addToCart } from "../../services/cartService";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export const groceryContext = createContext();
export const FreshBasketContext = createContext();

const cartItemsFromSessionStorage = handleSessionStorage('get', 'cartItems') || [];

const Layout = () => {
    const [cartItems, setCartItems] = useState(cartItemsFromSessionStorage);
    const [cartToastOpen, setCartToastOpen] = useState(false);
    const [cartToastMsg, setCartToastMsg] = useState('Added to cart');

    const showCartToast = useCallback((msg = 'Added to cart') => {
        setCartToastMsg(msg);
        setCartToastOpen(true);
    }, []);

    const { user } = useContext(AuthContext);

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
            cartItemsState: [cartItems, setCartItems],
            showCartToast,
        }}>
            <Navbar />
            <section className="min-h-screen pt-20">
                <Outlet />
            </section>
            <Footer />

            {/* Global "Added to cart" snackbar */}
            <Snackbar
                open={cartToastOpen}
                autoHideDuration={2500}
                onClose={() => setCartToastOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <MuiAlert
                    onClose={() => setCartToastOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%', fontWeight: 600, fontSize: '0.95rem' }}
                >
                    🛒 {cartToastMsg}
                </MuiAlert>
            </Snackbar>
        </FreshBasketContext.Provider>
    );
};

export default Layout;