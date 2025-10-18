import Redis from 'ioredis';

// This creates a new Redis client instance. It will automatically find the
// connection details in your .env.local file.
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 1 
});

export default redis;