// Simple Upstash Redis REST API client
class UpstashRedis {
  constructor(url, token) {
    this.url = url;
    this.token = token;
  }

  async get(key) {
    try {
      const response = await fetch(`${this.url}/get/${key}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!response.ok) return null;
      const data = await response.json();
      
      // ✅ FIX: Return just the result, not the whole Redis object
      return data.result;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, ...args) {
    try {
      const body = {};
      
      // ✅ FIX: Don't wrap value in an object
      // Upstash expects the value directly
      if (args[0] === 'EX' && args[1]) {
        // Use SETEX command for setting with expiration
        const response = await fetch(`${this.url}/setex/${key}/${args[1]}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: value, // Send the value directly as the body
        });
      } else {
        // Regular SET without expiration
        await fetch(`${this.url}/set/${key}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: value,
        });
      }
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }
}

const redis = new UpstashRedis(
  process.env.UPSTASH_REDIS_REST_URL,
  process.env.UPSTASH_REDIS_REST_TOKEN
);

export default redis;