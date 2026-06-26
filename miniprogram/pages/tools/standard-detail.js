// pages/tools/standard-detail.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 20,
    standard: null,
    loading: true,
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const id = parseInt(options.id) || 1;
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
    this.fetchStandard(id);
  },

  fetchStandard(id) {
    const that = this;
    get('/standards/' + id)
      .then(function (item) {
        const std = {
          title: item.title || '',
          publisher: '应急管理部',
          effectiveDate: item.createdAt ? item.createdAt.substring(0, 10) : '',
          scope: item.targetUser || '全体消防员',
          projects: (item.items || []).map(function (p) {
            return { name: p.name || '', pass: p.standard || '', excellent: p.standard || '' };
          }),
        };
        that.setData({ standard: std, loading: false });
      })
      .catch(function () {
        that.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  goBack() {
    wx.navigateBack({ delta: 1, fail() { wx.switchTab({ url: '/pages/index/index' }); } });
  },

  onDownload() {
    wx.showToast({ title: '文档下载功能开发中', icon: 'none' });
  },
});
