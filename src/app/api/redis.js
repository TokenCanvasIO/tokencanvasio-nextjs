import Redis from 'ioredis';

// This is the final version that works everywhere.
// It tries to use the Upstash URL first (for Netlify).
// If it can't find it, it falls back to the default local Redis URL.
const redis = new Redis(process.env.UPSTASH_REDIS_REST_URL || 'redis://127.0.0.1:6379');

export default redis;