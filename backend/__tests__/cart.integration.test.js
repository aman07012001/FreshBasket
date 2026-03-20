const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { env } = require('../config');
const { connectTestDB, safeDropDatabase } = require('./setupTestDB');

describe('Cart integration', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const uri = process.env.TEST_MONGO_URL || env.MONGO_URL;
    await connectTestDB(uri);
  });

  afterAll(async () => {
    await safeDropDatabase();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Cart.deleteMany({});
    await User.deleteMany({});
  });

  // ── Helper: register a user and return a cookie-bearing agent ──────────────
  async function createUserAgent({ email, password = 'Password1', name = 'Cart User' }) {
    const agent = request.agent(app);

    await agent
      .post('/api/auth/register')
      .send({ name, email, password })
      .expect(201);

    return agent;
  }

  // ── GET /api/cart ──────────────────────────────────────────────────────────

  test('GET returns empty cart for a new user', async () => {
    const agent = await createUserAgent({ email: 'cart_get@example.com' });

    const res = await agent.get('/api/cart').expect(200);

    expect(Array.isArray(res.body.cartItems)).toBe(true);
    expect(res.body.cartItems).toHaveLength(0);
    expect(res.body.totalPrice).toBe(0);
  });

  test('GET requires authentication', async () => {
    await request(app).get('/api/cart').expect(401);
  });

  // ── POST /api/cart ─────────────────────────────────────────────────────────

  test('POST adds a new item to the cart', async () => {
    const agent = await createUserAgent({ email: 'cart_post@example.com' });

    const res = await agent
      .post('/api/cart')
      .send({ productId: '4', name: 'Tomato', qty: 2, price: 2.99 })
      .expect(200);

    expect(res.body.cartItems).toHaveLength(1);
    expect(res.body.cartItems[0].productId).toBe('4');
    expect(res.body.cartItems[0].name).toBe('Tomato');
    expect(res.body.cartItems[0].qty).toBe(2);
    expect(res.body.totalPrice).toBe(5.98);
  });

  test('POST updates qty when item already exists', async () => {
    const agent = await createUserAgent({ email: 'cart_update@example.com' });

    // Add item
    await agent
      .post('/api/cart')
      .send({ productId: '4', name: 'Tomato', qty: 2, price: 2.99 })
      .expect(200);

    // Update qty
    const res = await agent
      .post('/api/cart')
      .send({ productId: '4', name: 'Tomato', qty: 5, price: 2.99 })
      .expect(200);

    expect(res.body.cartItems).toHaveLength(1);
    expect(res.body.cartItems[0].qty).toBe(5);
    expect(res.body.totalPrice).toBe(14.95);
  });

  test('POST adds multiple different items', async () => {
    const agent = await createUserAgent({ email: 'cart_multi@example.com' });

    await agent
      .post('/api/cart')
      .send({ productId: '4', name: 'Tomato', qty: 1, price: 2.99 })
      .expect(200);

    const res = await agent
      .post('/api/cart')
      .send({ productId: '8', name: 'Apple', qty: 3, price: 1.49 })
      .expect(200);

    expect(res.body.cartItems).toHaveLength(2);
    expect(res.body.totalPrice).toBe(parseFloat((2.99 + 3 * 1.49).toFixed(2)));
  });

  test('POST requires authentication', async () => {
    await request(app)
      .post('/api/cart')
      .send({ productId: '4', name: 'Tomato', qty: 1, price: 2.99 })
      .expect(401);
  });

  test('POST returns 400 for missing required fields', async () => {
    const agent = await createUserAgent({ email: 'cart_bad@example.com' });

    await agent
      .post('/api/cart')
      .send({ productId: '4', name: 'Tomato' }) // missing qty and price
      .expect(400);
  });

  // ── DELETE /api/cart/:productId ────────────────────────────────────────────

  test('DELETE removes an item from the cart', async () => {
    const agent = await createUserAgent({ email: 'cart_delete@example.com' });

    // Add item
    await agent
      .post('/api/cart')
      .send({ productId: '4', name: 'Tomato', qty: 2, price: 2.99 })
      .expect(200);

    // Delete it
    const res = await agent.delete('/api/cart/4').expect(200);

    expect(res.body.cartItems).toHaveLength(0);
    expect(res.body.totalPrice).toBe(0);
  });

  test('DELETE returns 404 when item does not exist in cart', async () => {
    const agent = await createUserAgent({ email: 'cart_del404@example.com' });

    await agent.delete('/api/cart/999').expect(404);
  });

  test('DELETE requires authentication', async () => {
    await request(app).delete('/api/cart/4').expect(401);
  });

  // ── GET after mutations ────────────────────────────────────────────────────

  test('GET reflects items added via POST', async () => {
    const agent = await createUserAgent({ email: 'cart_full@example.com' });

    await agent
      .post('/api/cart')
      .send({ productId: '4', name: 'Tomato', qty: 2, price: 2.99 })
      .expect(200);

    const res = await agent.get('/api/cart').expect(200);

    expect(res.body.cartItems).toHaveLength(1);
    expect(res.body.totalPrice).toBe(5.98);
  });

  test('carts are isolated per user', async () => {
    const agent1 = await createUserAgent({ email: 'cart_user1@example.com' });
    const agent2 = await createUserAgent({ email: 'cart_user2@example.com' });

    await agent1
      .post('/api/cart')
      .send({ productId: '4', name: 'Tomato', qty: 2, price: 2.99 })
      .expect(200);

    const res = await agent2.get('/api/cart').expect(200);
    expect(res.body.cartItems).toHaveLength(0);
  });
});
