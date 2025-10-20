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
      return data.result;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, ...args) {
    try {
      // Handle both: set(key, value, 'EX', seconds) and set(key, value)
      const body = { value };
      if (args[0] === 'EX' && args[1]) {
        body.ex = args[1];
      }
      
      await fetch(`${this.url}/set/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
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