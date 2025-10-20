// lib/amm-cache.js
class AMMCache {
  constructor() {
    this.pools = new Map();
    this.poolsList = null;
    this.poolsListTimestamp = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.POOLS_LIST_DURATION = 60 * 60 * 1000; // 1 hour
  } 
  setPool(accountId, data) {
    this.pools.set(accountId, { data, timestamp: Date.now() });
  }
  getPool(accountId) {
    const cached = this.pools.get(accountId);
    if (!cached) return null;
    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_DURATION) {
      this.pools.delete(accountId);
      return null;
    }
    return cached.data;
  }
  setPoolsList(pools) {
    this.poolsList = pools;
    this.poolsListTimestamp = Date.now();
  }
  getPoolsList() {
    if (!this.poolsList) return null;
    const age = Date.now() - this.poolsListTimestamp;
    if (age > this.POOLS_LIST_DURATION) {
      this.poolsList = null;
      this.poolsListTimestamp = null;
      return null;
    }
    return this.poolsList;
  }
  clear() {
    this.pools.clear();
    this.poolsList = null;
    this.poolsListTimestamp = null;
  }
  clearExpired() {
    const now = Date.now();
    for (const [key, value] of this.pools.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.pools.delete(key);
      }
    }
  }
  getStats() {
    return {
      poolsCount: this.pools.size,
      hasPoolsList: !!this.poolsList,
      poolsListAge: this.poolsListTimestamp ? Date.now() - this.poolsListTimestamp : null
    };
  }
}
export const ammCache = new AMMCache();
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    ammCache.clearExpired();
  }, 10 * 60 * 1000);
}