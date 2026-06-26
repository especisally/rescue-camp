const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 签发 JWT Token
 */
function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

/**
 * 验证 JWT Token，返回解码后的数据
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { signToken, verifyToken };
