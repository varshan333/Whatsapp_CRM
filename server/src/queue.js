let redis;
try {
  redis = require('./redis');
} catch (e) {
  redis = null;
}

const QUEUE_KEY = 'outbound_queue';

// In-memory fallback queue for local dev when Redis is unavailable
const memoryQueue = [];

async function enqueueMessage(payload) {
  if (redis && redis.lpush) {
    return redis.lpush(QUEUE_KEY, JSON.stringify(payload));
  }
  // push to head to mimic LPUSH
  memoryQueue.unshift(JSON.stringify(payload));
}

async function dequeueMessage() {
  if (redis && redis.rpop) {
    const data = await redis.rpop(QUEUE_KEY);
    return data ? JSON.parse(data) : null;
  }
  // pop from tail to mimic RPOP
  const data = memoryQueue.pop();
  return data ? JSON.parse(data) : null;
}

module.exports = { enqueueMessage, dequeueMessage };
