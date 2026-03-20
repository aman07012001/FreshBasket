import { API_ENDPOINTS } from '../utils/urlUtils';

export async function fetchCart() {
  try {
    const res = await fetch(API_ENDPOINTS.CART.GET(), {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('cartService.fetchCart error:', err);
    return null;
  }
}

export async function addToCart(item) {
  try {
    const res = await fetch(API_ENDPOINTS.CART.ADD(), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: String(item.id ?? item.productId),
        name: item.name,
        qty: item.quantity ?? item.qty ?? 1,
        price: item.price,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('cartService.addToCart error:', err);
    return null;
  }
}

export async function removeFromCart(productId) {
  try {
    const res = await fetch(API_ENDPOINTS.CART.REMOVE(String(productId)), {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('cartService.removeFromCart error:', err);
    return null;
  }
}
