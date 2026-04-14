const redis = require('redis');
require('dotenv').config();

// 通过环境变量控制是否使用真实Redis
const USE_REAL_REDIS = process.env.USE_REAL_REDIS === 'true';

let redisClient;

if (USE_REAL_REDIS) {
  // 真实Redis客户端
  redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined,
    database: parseInt(process.env.REDIS_DB) || 0
  });

  // 连接Redis
  redisClient.connect().then(() => {
    console.log('Redis连接成功');
    redisClient.isOpen = true;
  }).catch(err => {
    console.warn('Redis连接失败，将使用mock客户端:', err.message);
    // 回退到mock客户端
    initMockRedisClient();
  });
} else {
  // 使用mock客户端
  initMockRedisClient();
}

function initMockRedisClient() {
  redisClient = {
    isOpen: false,
    connect: () => Promise.resolve(),
    get: () => Promise.resolve(null),
    set: () => Promise.resolve(true),
    del: () => Promise.resolve(true),
    keys: () => Promise.resolve([]),
    quit: () => Promise.resolve()
  };
}

// 缓存操作封装
const cache = {
  // 设置缓存
  set: async (key, value, expiration = 3600) => {
    try {
      const jsonValue = JSON.stringify(value);
      await redisClient.set(key, jsonValue, {
        EX: expiration
      });
      return true;
    } catch (error) {
      console.error('缓存设置失败:', error.message);
      console.error('缓存设置失败详情:', {
        key,
        expiration,
        error: error.stack
      });
      return false;
    }
  },

  // 获取缓存
  get: async (key) => {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('缓存获取失败:', error.message);
      console.error('缓存获取失败详情:', {
        key,
        error: error.stack
      });
      return null;
    }
  },

  // 删除缓存
  del: async (key) => {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('缓存删除失败:', error.message);
      console.error('缓存删除失败详情:', {
        key,
        error: error.stack
      });
      return false;
    }
  },

  // 清除匹配模式的缓存
  clearPattern: async (pattern) => {
    try {
      // 检查Redis连接状态
      if (redisClient.isOpen === false) {
        console.warn('Redis连接未打开，跳过缓存清除操作');
        return false;
      }
      
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error('缓存清除失败:', error.message);
      console.error('缓存清除失败详情:', {
        pattern,
        error: error.stack
      });
      return false;
    }
  }
};

// 缓存键名生成器
const cacheKeys = {
  // 商品列表缓存键
  productList: (page = 1, limit = 10, category = '') => 
    `product:list:${category}:${page}:${limit}`,
  
  // 商品详情缓存键
  productDetail: (id) => 
    `product:detail:${id}`,
  
  // 热门商品缓存键
  hotProducts: (limit = 10) => 
    `product:hot:${limit}`,
  
  // 用户信息缓存键
  userInfo: (id) => 
    `user:info:${id}`,
  
  // 购物车缓存键
  cart: (userId) => 
    `cart:${userId}`
};

module.exports = {
  redisClient,
  cache,
  cacheKeys
};