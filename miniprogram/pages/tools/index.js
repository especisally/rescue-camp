// pages/tools/index.js
Page({
  data: {
    statusBarHeight: 20
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail() {
        wx.switchTab({ url: '/pages/index/index' });
      }
    });
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  onPlaceholderTap(e) {
    const url = e.currentTarget.dataset.url;
    wx.showToast({
      title: '功能开发中',
      icon: 'none',
      duration: 2000
    });
  }
});
