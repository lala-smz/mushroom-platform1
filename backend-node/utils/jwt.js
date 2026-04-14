const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '72h'; // 延长过期时间到72小时

const jwtUtils = {
  // 生成JWT令牌
  generateToken: (userId, role, username) => {
    const payload = {
      id: userId,
      role: role,
      username: username
    };
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  },

  // 验证JWT令牌
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  // 从令牌中提取用户信息
  extractUserInfo: (token) => {
    const decoded = jwtUtils.verifyToken(token);
    if (!decoded) return null;
    return {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username
    };
  }
};

module.exports = jwtUtils;