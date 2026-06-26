/**
 * 全局配置
 * 根据环境切换 API 地址
 */

// 生产环境
const baseUrl = 'https://www.yjjyzxy.top/api';

// 开发调试时可使用（需在开发者工具中关闭域名校验）
// const baseUrl = 'http://www.yjjyzxy.top/api';

module.exports = {
  baseUrl,
  timeout: 30000,        // 请求超时 30s
  uploadTimeout: 120000, // 上传超时 120s
};
