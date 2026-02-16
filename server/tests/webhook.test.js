const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
let app;
let _mongod;

beforeAll(async () => {
  const mongod = await MongoMemoryServer.create();
  _mongod = mongod;
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  // connect DB and require app
  const db = require('../src/db');
  await db.connect();
  app = require('../src/index_app');
});

afterAll(async () => {
  await mongoose.disconnect();
  if (_mongod) await _mongod.stop();
  // close redis if present
  try {
    const redis = require('../src/redis');
    if (redis && typeof redis.close === 'function') redis.close();
  } catch (e) {
    // ignore
  }
});

test('webhook status receipt updates Message.status and statusHistory', async () => {
  const { Message } = require('../src/models');

  // Create an initial message with providerMessageId
  const msg = await Message.create({
    clientId: null,
    conversationId: null,
    senderType: 'agent',
    messageType: 'template',
    content: { text: 'hello' },
    providerMessageId: 'abc-123',
    status: 'sent',
    statusHistory: [{ status: 'sent', timestamp: new Date(), raw: { note: 'initial' } }],
  });

  const server = request(app);

  // Simulate provider webhook (Meta-like shape)
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              statuses: [
                { id: 'abc-123', status: 'delivered', timestamp: Math.floor(Date.now() / 1000) }
              ]
            }
          }
        ]
      }
    ]
  };

  const res = await server.post('/webhook/incoming').send(payload);
  expect(res.status).toBe(200);

  // Poll DB for the update (retry loop)
  const waitFor = async (predicate, timeout = 3000, interval = 100) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await predicate()) return true;
      await new Promise(r => setTimeout(r, interval));
    }
    return false;
  };

  const ok = await waitFor(async () => {
    const updated = await Message.findById(msg._id).lean();
    return updated && updated.status === 'delivered' && Array.isArray(updated.statusHistory) && updated.statusHistory.length >= 2;
  }, 3000, 100);

  expect(ok).toBe(true);

  // Optional: assert last statusHistory entry matches 'delivered'
  const updated = await Message.findById(msg._id).lean();
  const last = updated.statusHistory[updated.statusHistory.length - 1];
  expect(last.status).toBe('delivered');
});