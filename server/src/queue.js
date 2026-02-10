const redis = require('./redis');

const QUEUE_KEY = 'outbound_queue';

async function enqueueMessage(payload) {
  await redis.lpush(QUEUE_KEY, JSON.stringify(payload));
}

async function dequeueMessage() {
  const data = await redis.rpop(QUEUE_KEY);
  return data ? JSON.parse(data) : null;
}

module.exports = { enqueueMessage, dequeueMessage };
