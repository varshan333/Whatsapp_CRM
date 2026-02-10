const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
let app;

beforeAll(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  // connect DB and require app
  const db = require('../src/db');
  await db.connect();
  app = require('../src/index_app');
});

afterAll(async () => {
  await mongoose.disconnect();
  // close redis if present
  try {
    const redis = require('../src/redis');
    if (redis && typeof redis.close === 'function') redis.close();
  } catch (e) {
    // ignore
  }
});

test('signup and login flow', async () => {
  const server = request(app);
  const signupRes = await server.post('/api/auth/signup').send({ fullName: 'Test User', email: 't@example.com', password: 'password123', agreeToTerms: true });
  expect(signupRes.status).toBe(201);
  expect(signupRes.body).toHaveProperty('accessToken');

  const loginRes = await server.post('/api/auth/login').send({ email: 't@example.com', password: 'password123' });
  expect(loginRes.status).toBe(200);
  expect(loginRes.body).toHaveProperty('accessToken');
});
