// pages/about/index.js
const app = getApp();

Page({
  data: {
    statusBarHeight: 0,
    appInfo: {
      icon: '🚒',
      name: '应急救援战训营',
      version: 'v0.2.5',
      description: '应急救援战训营是一款面向消防救援人员的专业培训平台，提供丰富的教学视频、实战案例、刷题练习和装备管理等功能，助力消防员提升专业技能和应急处置能力。',
      copyright: '© 2026 应急救援战训营',
    },
  },

  onLoad: function () { this.setData({ statusBarHeight: app.globalData.statusBarHeight || 44 }); },

  goBack: function () { wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/index/index' }); } }); },
});
