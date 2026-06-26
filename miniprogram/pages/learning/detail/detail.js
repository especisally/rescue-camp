// pages/learning/detail.js
const { get } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    statusBarHeight: 0,
    type: 'video',
    item: null,
    loading: true,
  },

  onLoad: function (options) {
    const id = options.id || '1';
    const type = options.type || 'video';
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20, type: type });
    this.fetchLearning(id);
  },

  fetchLearning: function (id) {
    const that = this;
    get('/learning/' + id)
      .then(function (item) {
        const formatted = {
          id: item.id, type: item.type || 'video',
          title: item.title || '',
          region: item.author || '',
          duration: that.formatDuration(item.duration),
          date: item.createdAt ? item.createdAt.substring(0, 10) : '',
          views: that.formatViews(item.views),
          bg: 'linear-gradient(135deg, #2c3e50, #3498db)',
          icon: item.type === 'video' ? '🎬' : '📄',
          description: item.description || '',
          format: 'PDF', size: item.fileSize || '—', source: item.author || '',
          iconBg: 'rgba(0,91,172,0.1)',
        };
        that.setData({ item: formatted, loading: false });
      })
      .catch(function () { that.setData({ loading: false }); });
  },

  formatDuration: function (sec) {
    if (!sec) return '00:00'; const m = Math.floor(sec / 60); const s = sec % 60;
    return m + ':' + (s < 10 ? '0' + s : s);
  },
  formatViews: function (n) {
    if (!n) return '0'; if (n >= 1000) return (n / 1000).toFixed(1) + 'k'; return String(n);
  },

  goBack: function () {
    wx.navigateBack({ delta: 1, fail: function () { wx.switchTab({ url: '/pages/index/index' }); } });
  },

  onRelatedTap: function (e) {
    const { id, type } = e.currentTarget.dataset;
    wx.redirectTo({ url: '/pages/learning/detail?id=' + id + '&type=' + (type || 'video') });
  },

  onShareAppMessage: function () {
    const item = this.data.item;
    return { title: item ? item.title : '拓展学习', path: '/pages/learning/detail?id=' + (item ? item.id : '') };
  },
});
