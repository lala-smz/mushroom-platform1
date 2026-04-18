const redis = require('redis');
require('dotenv').config();

const USE_REAL_REDIS = process.env.USE_REAL_REDIS === 'true';

let redisClient;

if (USE_REAL_REDIS) {
  redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined,
    database: parseInt(process.env.REDIS_DB) || 0
  });

  redisClient.connect().then(() => {
    console.log('Redis connected');
    redisClient.isOpen = true;
  }).catch(err => {
    console.warn('Redis connection failed, using mock client:', err.message);
    initMockRedisClient();
  });
} else {
  initMockRedisClient();
}

function initMockRedisClient() {
  redisClient = {
    isOpen: false,
    connect: () => Promise.resolve(),
    get: () => Promise.resolve(null),
    set: (key, value, options) => Promise.resolve(true),
    del: () => Promise.resolve(true),
    keys: () => Promise.resolve([]),
    quit: () => Promise.resolve()
  };
}

const cache = {
  set: async (key, value, expiration = 3600) => {
    try {
      const jsonValue = JSON.stringify(value);
      await redisClient.set(key, jsonValue, { EX: expiration });
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  },

  get: async (key) => {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  },

  del: async (key) => {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Cache del error:', error.message);
      return false;
    }
  },

  clearPattern: async (pattern) => {
    try {
      if (redisClient.isOpen === false) {
        console.warn('Redis not open, skipping clear');
        return false;
      }

      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache clear error:', error.message);
      return false;
    }
  }
};

const cacheKeys = {
  productList: (page = 1, limit = 10, category = '') =>
    `product:list:${category}:${page}:${limit}`,

  productDetail: (id) =>
    `product:detail:${id}`,

  hotProducts: (limit = 10) =>
    `product:hot:${limit}`,

  userInfo: (id) =>
    `user:info:${id}`,

  cart: (userId) =>
    `cart:${userId}`
};

module.exports = {
  redisClient,
  cache,
  cacheKeys
};