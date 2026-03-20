const express = require('express');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth(), async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, cartItems: [] });
    }

    const totalPrice = cart.cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    res.json({
      cartItems: cart.cartItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    });
  } catch (err) {
    console.error('GET /api/cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart.' });
  }
});

router.post('/', auth(), async (req, res) => {
  try {
    const { productId, name, qty, price } = req.body;

    if (!productId || !name || qty == null || price == null) {
      return res.status(400).json({
        error: 'productId, name, qty, and price are required.',
      });
    }

    if (typeof qty !== 'number' || qty < 1) {
      return res.status(400).json({ error: 'qty must be a positive number.' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'price must be a non-negative number.' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, cartItems: [] });
    }

    const existingIndex = cart.cartItems.findIndex(
      (item) => item.productId === String(productId)
    );

    if (existingIndex !== -1) {

      cart.cartItems[existingIndex].qty = qty;
    } else {

      cart.cartItems.push({
        productId: String(productId),
        name,
        qty,
        price,
      });
    }

    await cart.save();

    const totalPrice = cart.cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    res.json({
      cartItems: cart.cartItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    });
  } catch (err) {
    console.error('POST /api/cart error:', err);
    res.status(500).json({ error: 'Failed to update cart.' });
  }
});

router.delete('/:productId', auth(), async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    const beforeCount = cart.cartItems.length;
    cart.cartItems = cart.cartItems.filter(
      (item) => item.productId !== String(productId)
    );

    if (cart.cartItems.length === beforeCount) {
      return res.status(404).json({ error: 'Item not found in cart.' });
    }

    await cart.save();

    const totalPrice = cart.cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    res.json({
      cartItems: cart.cartItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    });
  } catch (err) {
    console.error('DELETE /api/cart/:productId error:', err);
    res.status(500).json({ error: 'Failed to remove item from cart.' });
  }
});

module.exports = router;
