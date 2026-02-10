const IORedis = require('ioredis');

const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

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
