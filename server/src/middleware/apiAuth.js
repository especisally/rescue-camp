const jwt = require('jsonwebtoken');
const config = require('../config');
const { fail } = require('../utils/response');

/**
 * 必需登录中间件
 * 验证 Header 中的 Bearer Token，解析出 userId 和 role
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(fail(401, '未登录或 token 已过期'));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json(fail(401, 'Token 无效或已过期'));
  }
}

/**
 * 可选登录中间件
 * 如果带了有效 Token 就注入 userId，否则当游客处理
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      req.userId = decoded.userId;
    } catch (err) {
      // 忽略无效 token，当作游客
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
