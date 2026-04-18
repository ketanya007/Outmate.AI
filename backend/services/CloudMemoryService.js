const { Redis } = require('@upstash/redis');

// Initialize Redis if credentials are provided
let redis = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('[CloudMemoryService] Redis initialized successfully.');
  } else {
    console.warn('[CloudMemoryService] Missing Redis credentials. Using in-memory fallback (NO PERSISTENCE).');
  }
} catch (initErr) {
  console.error('[CloudMemoryService] Fatal Redis initialization error:', initErr.message);
  redis = null;
}

// In-memory fallback for local dev or missing credentials
const memoryCache = new Map();

/**
 * CloudMemoryService — Handles persistence and caching for query results using Upstash Redis.
 */
class CloudMemoryService {
  /**
   * Search for a cached result by query.
   * @param {string} query 
   * @returns {Promise<object|null>}
   */
  static async get(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    // 1. Try Redis first
    if (redis) {
      try {
        const result = await redis.get(`cache:${normalizedQuery}`);
        if (result) {
          console.log(`[CloudMemoryService] Cache hit (Redis) for query: "${query}"`);
          return result;
        }
      } catch (err) {
        console.error(`[CloudMemoryService] Redis get failed:`, err.message);
      }
    }

    // 2. Fallback to in-memory
    const memResult = memoryCache.get(normalizedQuery);
    if (memResult) {
      console.log(`[CloudMemoryService] Cache hit (In-Memory) for query: "${query}"`);
      return memResult;
    }

    return null;
  }

  /**
   * Save a successful result to the cache.
   * @param {string} query 
   * @param {object} result 
   */
  static async save(query, result) {
    const normalizedQuery = query.toLowerCase().trim();

    // 1. Save to Redis
    if (redis) {
      try {
        // Cache with 24-hour TTL (86400 seconds)
        await redis.set(`cache:${normalizedQuery}`, result, { ex: 86400 });
        console.log(`[CloudMemoryService] Saved to Redis for query: "${query}"`);
      } catch (err) {
        console.error(`[CloudMemoryService] Redis save failed:`, err.message);
      }
    }

    // 2. Save to in-memory fallback
    memoryCache.set(normalizedQuery, result);
    // Auto-cleanup in-memory after 1 hour to prevent leaks
    setTimeout(() => memoryCache.delete(normalizedQuery), 3600000);
  }
}

module.exports = CloudMemoryService;
