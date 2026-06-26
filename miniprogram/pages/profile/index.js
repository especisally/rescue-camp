// pages/profile/index.js
const app = getApp();
const { get, post } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: app.globalData.statusBarHeight || 44,
    isLoggedIn: false,
    userInfo: {
      name: '未登录',
      id: '',
      badge: '',
      avatar: '👤',
      points: '0',
    },
    loading: false,
    menuGroup1: [
      { id: 1, name: '我的收藏', icon: '⭐', url: '/pages/favorites/index' },
      { id: 2, name: '我的评论', icon: '💬', url: '/pages/comments/index' },
      { id: 3, name: '我的上传', icon: '📤', url: '/pages/uploads/index' },
    ],
    menuGroup3: [
      { id: 1, name: '帮助反馈', icon: '❓', url: '/pages/help/index' },
      { id: 2, name: '关于战训资源', icon: 'ℹ️', url: '/pages/about/index' },
    ],
  },

  onLoad: function () {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 44 });
    this.syncLoginState();
  },

  onShow: function () {
    this.syncLoginState();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  syncLoginState: function () {
    const isLoggedIn = app.globalData.isLoggedIn;
    if (isLoggedIn && app.globalData.userInfo) {
      const u = app.globalData.userInfo;
      this.setData({
        isLoggedIn: true,
        userInfo: {
          name: u.nickname || '消防员',
          id: String(u.id || ''),
          badge: u.level || u.role || '',
          avatar: u.avatar || '👨‍🚒',
          points: String(u.points || 0),
        },
      });
    } else {
      this.setData({ isLoggedIn: false });
    }
  },

  toggleLogin: function () {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/login/index' });
      return;
    }
    // Logout
    const that = this;
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: function (res) {
        if (res.confirm) {
          app.logout();
          that.setData({
            isLoggedIn: false,
            userInfo: { name: '未登录', id: '', badge: '', avatar: '👤', points: '0' },
          });
          wx.showToast({ title: '已退出登录', icon: 'none' });
        }
      },
    });
  },

  onEditProfile: function () {
    wx.navigateTo({ url: '/pages/profile/edit' });
  },

  onSearchTap: function () { wx.navigateTo({ url: '/pages/search/index' }); },

  onSettingsTap: function () {
    wx.navigateTo({ url: '/pages/settings/index', fail: function () { wx.showToast({ title: '设置页开发中', icon: 'none' }); } });
  },

  onMenuTap: function (e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url: url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  onShareAppMessage: function () {
    return { title: '应急救援战训营', path: '/pages/profile/index' };
  },
});
