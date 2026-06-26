const { fail } = require('../utils/response');

/**
 * 后台 Session 鉴权中间件
 * 未登录的 API 请求返回 401 JSON，页面请求重定向到登录页
 */
function adminAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  // API 请求返回 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(401).json(fail(401, '请先登录'));
  }
  // 页面请求重定向
  return res.redirect('/admin/login');
}

module.exports = { adminAuth };
