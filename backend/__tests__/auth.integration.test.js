const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { env } = require('../config');
const { connectTestDB, safeDropDatabase } = require('./setupTestDB');

// NOTE: For real projects, consider using mongodb-memory-server for isolation.

describe('Auth integration', () => {
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
    await User.deleteMany({});
  });

  test('register -> login -> me', async () => {
    const agent = request.agent(app);

    const registerRes = await agent
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Password1' })
      .expect(201);

    expect(registerRes.body.user.email).toBe('test@example.com');
    expect(registerRes.headers['set-cookie']).toBeDefined();

    const meRes = await agent.get('/api/auth/me').expect(200);
    expect(meRes.body.user.email).toBe('test@example.com');
  });

  test('login issues cookies then refresh rotates refresh token', async () => {
    const agent = request.agent(app);

    await agent
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'refresh@example.com', password: 'Password1' })
      .expect(201);

    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: 'refresh@example.com', password: 'Password1' })
      .expect(200);

    expect(loginRes.headers['set-cookie']).toBeDefined();

    const refreshRes = await agent.post('/api/auth/refresh').expect(200);
    expect(refreshRes.headers['set-cookie']).toBeDefined();
  });

  test('logout invalidates refresh', async () => {
    const agent = request.agent(app);

    await agent
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'logout@example.com', password: 'Password1' })
      .expect(201);

    await agent
      .post('/api/auth/login')
      .send({ email: 'logout@example.com', password: 'Password1' })
      .expect(200);

    await agent.post('/api/auth/logout').expect(204);

    await agent.post('/api/auth/refresh').expect(401);
  });
});
