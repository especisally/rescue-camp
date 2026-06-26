/**
 * 简易频率限制中间件
 * 基于内存的滑动窗口限流，生产环境建议替换为 express-rate-limit + Redis
 */

const store = new Map();

function rateLimiter(windowMs = 60000, maxRequests = 30) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!store.has(key)) {
      store.set(key, []);
    }

    const timestamps = store.get(key).filter(t => now - t < windowMs);
    timestamps.push(now);
    store.set(key, timestamps);

    if (timestamps.length > maxRequests) {
      return res.status(429).json({
        code: 429,
        message: '请求过于频繁，请稍后再试',
        data: null,
      });
    }

    next();
  };
}

// 每分钟清理一次过期记录
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of store.entries()) {
    const valid = timestamps.filter(t => now - t < 60000);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      store.set(key, valid);
    }
  }
}, 60000);

module.exports = { rateLimiter };
