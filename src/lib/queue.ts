import redis from "./redis";

const QUEUE_KEY = "outbound_queue";

// In-memory fallback queue for local dev when Redis is unavailable or fails
// Note: In serverless (Next.js), in-memory queue is NOT reliable between requests.
// Use Redis for production.
const memoryQueue: string[] = [];

export interface QueueJob {
  id?: string;
  type: string;
  to: string;
  templateName?: string;
  language?: string;
  components?: any[];
  [key: string]: any;
}

export async function enqueueMessage(payload: QueueJob) {
  if (redis) {
    try {
      if (redis.status !== "ready" && redis.status !== "connect") {
        await redis.connect().catch(() => {}); // Attempt connect if not ready
      }
      return await redis.lpush(QUEUE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn(
        "Redis enqueue failed, using memory fallback (unreliable in serverless)",
        e,
      );
    }
  }
  // push to head to mimic LPUSH
  memoryQueue.unshift(JSON.stringify(payload));
}

export async function dequeueMessage(): Promise<QueueJob | null> {
  if (redis) {
    try {
      if (redis.status !== "ready" && redis.status !== "connect") {
        await redis.connect().catch(() => {});
      }
      const data = await redis.rpop(QUEUE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn("Redis dequeue failed, using memory fallback", e);
    }
  }
  // pop from tail to mimic RPOP
  const data = memoryQueue.pop();
  return data ? JSON.parse(data) : null;
}
