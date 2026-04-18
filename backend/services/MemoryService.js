const Datastore = require('nedb');
const path = require('path');

// Initialize database
const db = new Datastore({
  filename: path.join(__dirname, '../data/memory.db'),
  autoload: true
});

/**
 * MemoryService — Handles persistence and caching for query results.
 */
class MemoryService {
  /**
   * Search for a cached result by query.
   * @param {string} query 
   * @returns {Promise<object|null>}
   */
  static async get(query) {
    return new Promise((resolve, reject) => {
      // Basic normalization: trim and lowercase
      const normalizedQuery = query.toLowerCase().trim();
      
      db.findOne({ query: normalizedQuery }, (err, doc) => {
        if (err) return reject(err);
        if (!doc) return resolve(null);

        // Optional: Check TTL (e.g., 24 hours)
        const ageInHours = (new Date() - new Date(doc.timestamp)) / (1000 * 60 * 60);
        if (ageInHours > 24) {
          console.log(`[MemoryService] Cache expired for query: "${query}"`);
          return resolve(null);
        }

        console.log(`[MemoryService] Cache hit for query: "${query}"`);
        resolve(doc.result);
      });
    });
  }

  /**
   * Save a successful result to the cache.
   * @param {string} query 
   * @param {object} result 
   */
  static async save(query, result) {
    return new Promise((resolve, reject) => {
      const normalizedQuery = query.toLowerCase().trim();
      const doc = {
        query: normalizedQuery,
        result: result,
        timestamp: new Date().toISOString()
      };

      // Upsert: update if exists, otherwise insert
      db.update(
        { query: normalizedQuery },
        doc,
        { upsert: true },
        (err) => {
          if (err) return reject(err);
          console.log(`[MemoryService] Saved result to cache for query: "${query}"`);
          resolve();
        }
      );
    });
  }
}

module.exports = MemoryService;
