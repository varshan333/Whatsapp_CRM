// Minimal Redis wrapper to support the queue
import Redis from "ioredis";

// Reuse this connection or create a new one?
// For serverless functions, creating new connections can be expensive.
// But for a queue, we might desire it.
// The original code handled a module-level variable.
// In Next.js, we often use global cache for DBs. Redis clients handle their own connection pooling usually.

const REDIS_URL = process.env.REDIS_URL;

let redis: Redis | null = null;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    lazyConnect: true, // Don't connect until used
  });
}

export default redis;
