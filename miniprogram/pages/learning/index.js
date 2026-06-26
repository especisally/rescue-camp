// pages/learning/index.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    activeFilter: 1,
    filters: [
      { id: 1, name: '全部', active: true },
      { id: 2, name: '视频课程', active: false },
      { id: 3, name: '文档资料', active: false },
    ],
    videos: [],
    documents: [],
    loading: false,
  },

  onLoad: function () {
    const app = getApp();
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 });
    this.fetchLearning();
  },

  fetchLearning: function () {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const that = this;

    get('/learning', { pageSize: 50 })
      .then(function (data) {
        const videos = [];
        const docs = [];
        (data.list || []).forEach(function (item) {
          if (item.type === 'video') {
            videos.push({
              id: item.id, title: item.title,
              region: item.author || '', duration: that.formatDuration(item.duration),
              date: item.createdAt ? item.createdAt.substring(0, 10) : '',
              views: that.formatViews(item.views),
              bg: 'linear-gradient(135deg, #2c3e50, #3498db)', icon: '🌊',
            });
          } else {
            docs.push({
              id: item.id, title: item.title,
              format: 'PDF', size: item.fileSize || '—',
              source: item.author || '', icon: '📄',
              iconBg: 'rgba(0,91,172,0.1)',
            });
          }
        });
        that.setData({ videos, documents: docs, loading: false });
      })
      .catch(function () { that.setData({ loading: false }); });
  },

  formatDuration: function (sec) {
    if (!sec) return '00:00';
    const m = Math.floor(sec / 60); const s = sec % 60;
    return m + ':' + (s < 10 ? '0' + s : s);
  },
  formatViews: function (n) {
    if (!n) return '0';
    if (n >= 10000) return (n / 10000).toFixed(1) + 'k';
    return String(n);
  },

  switchFilter: function (e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activeFilter) return;
    const filters = this.data.filters.map(function (f) {
      f.active = f.id === id; return f;
    });
    this.setData({ filters, activeFilter: id });
  },

  onSearchTap: function () {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  onVideoTap: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/learning/detail?id=' + id + '&type=video' });
  },

  onDocTap: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/learning/detail?id=' + id + '&type=doc' });
  },
});
