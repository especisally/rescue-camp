const app = getApp();
const { post } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    appName: '应急救援战训营',
    subtitle: '专业救援培训平台',
    logo: '🚒',
    isLoggingIn: false,
  },

  onLoad: function () {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 44,
    });
  },

  goBack: function () {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/index/index' });
      },
    });
  },

  /**
   * 微信一键登录
   * 流程：wx.login() → 获取 code → 后端换取 token → 保存登录状态
   */
  onWechatLogin: function () {
    if (this.data.isLoggingIn) return;
    this.setData({ isLoggingIn: true });

    const that = this;

    // 1. 调用 wx.login 获取 code
    wx.login({
      success: function (loginRes) {
        if (!loginRes.code) {
          that.setData({ isLoggingIn: false });
          wx.showToast({ title: '微信登录失败，请重试', icon: 'none' });
          return;
        }

        // 2. 发送 code 到后端换取 token
        post('/auth/login', { code: loginRes.code })
          .then(function (data) {
            const { token, user } = data;

            // 3. 保存登录状态
            app.loginSuccess(token, user);

            wx.showToast({ title: '登录成功', icon: 'success' });
            setTimeout(function () {
              wx.navigateBack({
                fail: function () {
                  wx.switchTab({ url: '/pages/index/index' });
                },
              });
            }, 800);
          })
          .catch(function (err) {
            that.setData({ isLoggingIn: false });
            console.error('登录失败:', err);
            wx.showToast({ title: err.message || '登录失败，请检查网络', icon: 'none' });
          });
      },
      fail: function () {
        that.setData({ isLoggingIn: false });
        wx.showToast({ title: '微信登录失败，请重试', icon: 'none' });
      },
    });
  },

  /**
   * 跳过登录（游客模式）
   */
  onSkipLogin: function () {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/index/index' });
      },
    });
  },
});
