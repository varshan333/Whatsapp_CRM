const IORedis = require('ioredis');

// If a REDIS_URL is provided, create a real client. Otherwise export a dummy
// client to avoid connection attempts in local dev/tests.
const REDIS_URL = process.env.REDIS_URL || 'http://localhost:6379';

if (!REDIS_URL) {
	// dummy client with minimal methods used by the app
	const dummy = {
		lpush: async () => {},
		rpop: async () => null,
		on: () => {},
		quit: async () => {},
		close: async () => {},
	};
	module.exports = dummy;
} else {
	const redis = new IORedis(REDIS_URL);
	redis.on('connect', () => console.log('Connected to Redis'));
	redis.on('error', (err) => console.error('Redis error', err));

	function close() {
		try {
			redis.quit();
		} catch (e) {
			// ignore
		}
	}

	module.exports = Object.assign(redis, { close });
}
