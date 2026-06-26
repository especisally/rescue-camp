// pages/uploads/index.js
const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    uploads: [],
    loading: false,
  },

  onLoad: function () { this.setData({ statusBarHeight: app.globalData.statusBarHeight || 44 }); this.fetchUploads(); },

  fetchUploads: function () {
    const that = this;
    this.setData({ loading: true });
    get('/users/me/uploads', { pageSize: 50 }, { auth: true })
      .then(function (data) {
        const statusMap = { 1: '已发布', 0: '审核中' };
        const uploads = (data.list || []).map(function (item) {
          return {
            id: item.id,
            title: item.title || '',
            type: item.type === 'video' ? '视频' : '图文',
            status: item.status === 1 ? 'published' : 'reviewing',
            statusText: statusMap[item.status] || '审核中',
            time: item.createdAt ? item.createdAt.substring(0, 10) : '',
            icon: item.type === 'video' ? '🎬' : '📄',
          };
        });
        that.setData({ uploads, loading: false });
      })
      .catch(function () { that.setData({ loading: false }); });
  },

  goBack: function () { wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/profile/index' }); } }); },
});
