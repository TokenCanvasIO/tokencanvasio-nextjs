// scripts/clearcache.js
require('dotenv').config({ path: '.env.local' });
const Redis = require('ioredis');

async function clearCache() {
  console.log('Attempting to connect to Redis to clear cache...');

  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  });

  try {
    await redis.flushall();
    console.log('✅ Success! Redis cache has been cleared.');
  } catch (error) {
    console.error('❌ Error: Failed to clear Redis cache.', error.message);
  } finally {
    redis.quit();
  }
}

clearCache();