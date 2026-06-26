const { fail } = require('../utils/response');

/**
 * 统一错误处理中间件
 */
function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err);

  // Prisma 已知错误
  if (err.code === 'P2025') {
    return res.status(404).json(fail(404, '资源不存在'));
  }
  if (err.code === 'P2002') {
    return res.status(422).json(fail(422, '数据重复'));
  }

  return res.status(500).json(fail(500, process.env.NODE_ENV === 'production' ? '服务器错误' : err.message));
}

module.exports = { errorHandler };
