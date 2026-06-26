/**
 * 网络请求封装
 * 功能：统一 Header、Token 注入、响应拦截、错误处理
 */

const config = require('../config/index');

// 请求队列（用于 token 过期自动刷新）
let isRefreshing = false;
let refreshQueue = [];

/**
 * 获取存储的 token
 */
function getToken() {
  try {
    return wx.getStorageSync('access_token') || '';
  } catch (e) {
    return '';
  }
}

/**
 * 保存 token
 */
function setToken(token) {
  try {
    wx.setStorageSync('access_token', token);
  } catch (e) {
    console.error('Token 存储失败:', e);
  }
}

/**
 * 清除 token
 */
function clearToken() {
  try {
    wx.removeStorageSync('access_token');
    wx.removeStorageSync('user_info');
  } catch (e) {
    console.error('Token 清除失败:', e);
  }
}

/**
 * 核心请求方法
 * @param {object} options
 * @param {string} options.url      - 接口路径（不含 baseUrl）
 * @param {string} options.method   - HTTP 方法（GET/POST/PUT/DELETE）
 * @param {object} options.data     - 请求参数
 * @param {boolean} options.auth    - 是否需要登录认证（默认 false）
 * @param {boolean} options.showLoading - 是否显示 loading（默认 false）
 * @returns {Promise<{code: number, message: string, data: any}>}
 */
function request({ url, method = 'GET', data = {}, auth = false, showLoading = false }) {
  if (showLoading) {
    wx.showLoading({ title: '加载中...', mask: true });
  }

  return new Promise((resolve, reject) => {
    const header = {};
    header['Content-Type'] = 'application/json';

    // 需要认证时注入 Token
    if (auth) {
      const token = getToken();
      if (token) {
        header['Authorization'] = 'Bearer ' + token;
      }
    }

    wx.request({
      url: config.baseUrl + url,
      method,
      data,
      header,
      timeout: config.timeout,
      success: function (res) {
        if (showLoading) wx.hideLoading();

        const { code, message, data: resData } = res.data || {};

        switch (code) {
          case 0:
            // 成功
            resolve(resData);
            break;
          case 401:
            // Token 过期，清除并跳转登录
            clearToken();
            const app = getApp();
            if (app) app.globalData.isLoggedIn = false;
            wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
            reject({ code: 401, message: message || '登录已过期' });
            break;
          case 403:
            wx.showToast({ title: message || '无权限', icon: 'none' });
            reject({ code: 403, message: message || '无权限' });
            break;
          case 404:
            wx.showToast({ title: message || '资源不存在', icon: 'none' });
            reject({ code: 404, message: message || '资源不存在' });
            break;
          case 422:
            wx.showToast({ title: message || '参数错误', icon: 'none' });
            reject({ code: 422, message: message || '参数错误' });
            break;
          default:
            reject({ code: code || 500, message: message || '请求失败' });
            break;
        }
      },
      fail: function (err) {
        if (showLoading) wx.hideLoading();
        console.error('网络请求失败:', err);
        wx.showToast({ title: '网络连接失败', icon: 'none' });
        reject({ code: -1, message: '网络连接失败' });
      },
    });
  });
}

/**
 * GET 请求
 */
function get(url, data = {}, options = {}) {
  return request({ url, method: 'GET', data, ...options });
}

/**
 * POST 请求
 */
function post(url, data = {}, options = {}) {
  return request({ url, method: 'POST', data, ...options });
}

/**
 * PUT 请求
 */
function put(url, data = {}, options = {}) {
  return request({ url, method: 'PUT', data, ...options });
}

/**
 * DELETE 请求
 */
function del(url, data = {}, options = {}) {
  return request({ url, method: 'DELETE', data, ...options });
}

/**
 * 上传文件
 * @param {string} url     - 上传接口路径
 * @param {string} filePath - 本地文件路径
 * @param {string} type     - image/video/file
 * @returns {Promise<{url: string, filename: string}>}
 */
function upload(url, filePath, type = 'image') {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: config.baseUrl + url,
      filePath,
      name: 'file',
      header: {
        'Authorization': 'Bearer ' + getToken(),
      },
      timeout: config.uploadTimeout,
      success: function (res) {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data.data);
          } else {
            wx.showToast({ title: data.message || '上传失败', icon: 'none' });
            reject(data);
          }
        } catch (e) {
          reject({ code: -1, message: '解析响应失败' });
        }
      },
      fail: function (err) {
        console.error('上传失败:', err);
        reject({ code: -1, message: '上传失败' });
      },
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload,
  getToken,
  setToken,
  clearToken,
};
