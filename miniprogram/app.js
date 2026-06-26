const { getToken, setToken, clearToken, get } = require('./utils/request');

App({
  onLaunch: function () {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData = {
      statusBarHeight: systemInfo.statusBarHeight,
      navBarHeight: 44,
      env: '',
      isLoggedIn: false,
      userInfo: null,
      token: '',
    };

    // 初始化云开发（保留兼容）
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }

    // 检查登录状态
    this.checkLoginState();
  },

  /**
   * 检查登录状态
   * 从本地存储读取 token，验证是否已登录
   */
  checkLoginState: function () {
    const token = getToken();
    const userInfo = this.getUserInfo();

    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.isLoggedIn = true;
      this.globalData.userInfo = userInfo;
      console.log('✅ 已登录:', userInfo.nickname);
    } else if (token && !userInfo) {
      // Token 有效但用户信息丢失，尝试重新获取
      this.globalData.token = token;
      this.fetchUserProfile();
    } else {
      console.log('⚠️ 未登录');
    }
  },

  /**
   * 获取用户信息（从后端）
   */
  fetchUserProfile: function () {
    get('/users/me', {}, { auth: true })
      .then((user) => {
        this.globalData.isLoggedIn = true;
        this.globalData.userInfo = user;
        this.saveUserInfo(user);
        console.log('✅ 用户信息已同步');
      })
      .catch(() => {
        // Token 可能已过期，清除登录状态
        this.logout();
      });
  },

  /**
   * 登录成功后保存状态
   */
  loginSuccess: function (token, user) {
    setToken(token);
    this.globalData.token = token;
    this.globalData.isLoggedIn = true;
    this.globalData.userInfo = user;
    this.saveUserInfo(user);
  },

  /**
   * 退出登录
   */
  logout: function () {
    clearToken();
    this.globalData.token = '';
    this.globalData.isLoggedIn = false;
    this.globalData.userInfo = null;
    wx.removeStorageSync('user_info');
  },

  /**
   * 保存用户信息到本地
   */
  saveUserInfo: function (user) {
    try {
      wx.setStorageSync('user_info', user);
    } catch (e) {
      console.error('保存用户信息失败:', e);
    }
  },

  /**
   * 从本地读取用户信息
   */
  getUserInfo: function () {
    try {
      return wx.getStorageSync('user_info') || null;
    } catch (e) {
      return null;
    }
  },

  globalData: {
    statusBarHeight: 0,
    navBarHeight: 44,
    env: '',
    isLoggedIn: false,
    userInfo: null,
    token: '',
  },
});
