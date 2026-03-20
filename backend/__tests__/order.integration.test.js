const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Order = require('../models/Order');
const User = require('../models/User');
const { env } = require('../config');
const { connectTestDB, safeDropDatabase } = require('./setupTestDB');

jest.mock('../utils/sendEmail', () => ({
  sendOrderEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('Order integration', () => {
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
    await Order.deleteMany({});
    await User.deleteMany({});
  });

  async function createUserAgent({ email, password = 'Password1', name = 'Test User', role = 'user' }) {
    const agent = request.agent(app);

    const registerRes = await agent
      .post('/api/auth/register')
      .send({ name, email, password })
      .expect(201);

    expect(registerRes.body.user.email).toBe(email);

    if (role === 'admin') {
      await User.updateOne({ email }, { role: 'admin' });
    }

    return agent;
  }

  function buildOrderPayload(overrides = {}) {
    return {
      items: [
        {
          productId: 'prod-1',
          name: 'Test Product',
          price: 10,
          quantity: 2,
        },
      ],
      paymentMethod: 'COD',
      totalAmount: 20,
      deliveryAddress: {
        name: 'John Doe',
        phone: '1234567890',
        pincode: '123456',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
      },
      ...overrides,
    };
  }

  test('creates an order successfully', async () => {
    const userAgent = await createUserAgent({ email: 'orderuser@example.com' });

    const res = await userAgent
      .post('/api/orders')
      .send(buildOrderPayload())
      .expect(201);

    expect(res.body.order).toBeDefined();
    expect(res.body.order.orderId).toBeDefined();
    expect(res.body.order.items).toHaveLength(1);

    const saved = await Order.findOne({ orderId: res.body.order.orderId });
    expect(saved).not.toBeNull();
    expect(saved.userId).toBeDefined();
  });

  test('is idempotent when the same orderId is used', async () => {
    const userAgent = await createUserAgent({ email: 'idempotent@example.com' });
    const orderId = 'order-123-idem';

    const payload = buildOrderPayload({ orderId });

    const res1 = await userAgent.post('/api/orders').send(payload).expect(201);
    const res2 = await userAgent.post('/api/orders').send(payload).expect(200);

    expect(res1.body.order._id).toBe(res2.body.order._id);

    const count = await Order.countDocuments({});
    expect(count).toBe(1);
  });

  test('returns my orders for the current user', async () => {
    const userAgent = await createUserAgent({ email: 'myorders@example.com' });

    await userAgent.post('/api/orders').send(buildOrderPayload()).expect(201);

    const res = await userAgent.get('/api/orders/my').expect(200);

    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.orders.length).toBe(1);
  });

  test("prevents another user from accessing someone else's order", async () => {
    const user1 = await createUserAgent({ email: 'owner@example.com' });
    const user2 = await createUserAgent({ email: 'other@example.com' });

    const createRes = await user1
      .post('/api/orders')
      .send(buildOrderPayload())
      .expect(201);

    const orderId = createRes.body.order.orderId;

    await user2.get(`/api/orders/${orderId}`).expect(403);
  });

  test('allows admin to access any order', async () => {
    const userAgent = await createUserAgent({ email: 'normal@example.com' });
    const adminAgent = await createUserAgent({ email: 'admin@example.com', role: 'admin' });

    const createRes = await userAgent
      .post('/api/orders')
      .send(buildOrderPayload())
      .expect(201);

    const orderId = createRes.body.order.orderId;

    const res = await adminAgent.get(`/api/orders/${orderId}`).expect(200);

    expect(res.body.order.orderId).toBe(orderId);
  });

  test('allows admin to update order status', async () => {
    const userAgent = await createUserAgent({ email: 'statususer@example.com' });
    const adminAgent = await createUserAgent({ email: 'statusadmin@example.com', role: 'admin' });

    const createRes = await userAgent
      .post('/api/orders')
      .send(buildOrderPayload())
      .expect(201);

    const orderId = createRes.body.order.orderId;

    const res = await adminAgent
      .put(`/api/orders/${orderId}`)
      .send({ status: 'shipped' })
      .expect(200);

    expect(res.body.order.status).toBe('shipped');
  });

  test('requires authentication for protected routes', async () => {
    await request(app).post('/api/orders').send(buildOrderPayload()).expect(401);
    await request(app).get('/api/orders/my').expect(401);
  });
});
