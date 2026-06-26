/**
 * 统一 JSON 响应
 *
 * 错误码：
 *   0    — 成功
 *   401  — 未登录/token 过期
 *   403  — 无权限
 *   404  — 资源不存在
 *   422  — 参数校验失败
 *   500  — 服务器错误
 */

function success(data, message = 'success') {
  return { code: 0, message, data };
}

function fail(code, message) {
  return { code, message, data: null };
}

function paginate(list, page, pageSize, total) {
  return {
    code: 0,
    message: 'success',
    data: {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

module.exports = { success, fail, paginate };
